const graphql = require('graphql');
const lodash = require('lodash');

const { SCALAR } = require('./scalar');

// ! OBJECT_TYPE_DEFINITION, OBJECT_TYPE_EXTENSION 和 UNION_TYPE_DEFINITION, UNION_TYPE_EXTENSION 都是输出 type
// ! 暂时不提供生成. 原因有不少:
// 1. 输出 type 对于服务端而言其实并没有多大用, 而客户端又不是很需要根据服务端 schema 生成的输出 type, 客户端需要的是根据自己客户端的 gql 查询文件定义的输出 type, 另外, 客户端也需要 variables type
// 2. 客户端的 gql 的 type 生成逻辑与服务端有较大不同, 客户端的 type 生成应该是每个 gql 文件都放进一个 namespace 中, 因为客户端的 gql 其实本质是 js 模块内定义查询对象,
//    而服务端应该把所有 gql 文件合并, 不用放进 namespace 中...
// 3. 另外, 客户端的 variables type 好生成, 但是输出 type 却太模糊了, 完全不知道是数组还是对象, 是可空还是非空...这里应该结合服务端生成的 type, 不过逻辑蛮复杂, 以后再做
// [graphql.Kind.OBJECT_TYPE_DEFINITION]: node => {
//   current_object_type_name = node.name.value;
//   // ? 这是输出 type
//   // ! 不知道该不该放进 ts 中...主要是输出 type 可能对客户端有用, 然后 ts 中 interface 与 namespace 重名并不影响使用
//   gen_code += interface_type(node);
// },
// [graphql.Kind.OBJECT_TYPE_EXTENSION]: node => {
//   current_object_type_name = node.name.value;
//   // ? 输出 type
//   gen_code += interface_type(node);
// },
//     // ? union 是输出 type, 不能作为参数, 没必要生成对应 ts 类型...
//     [graphql.Kind.UNION_TYPE_DEFINITION]: node => {
//       gen_code += `
// export type ${node.name.value} = ${node.types.map(it => it.name.value).join(' | ')};
// `;
//     },

exports.parse = source => {
  let current_object_type_name = '';
  let namespace = new_namespace();

  const ast = graphql.parse(source);

  graphql.visit(ast, {
    [graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION]: node => {
      let patch = new_namespace();
      let inter = (patch.interfaces[node.name.value] = {});
      node.fields.map(it => {
        // ? 下面三处 inter[it.name.value+'?'] = real_type.slice(0, -7); 到底是否合适.
        // ? 因为 var a: {a?:number} = {} as {a:number|null} 是可以的, 但 var a: {a:number|null} = {} as {a?:number} 却不行
        // ? 同时, skm_ts 生成的 type 主要设置 resolver args 类型, args 又主要用于等号右侧...
        // x? 所以 server 这边的 input type 和 args type 应该用 {a:number|null}
        // x? 而 client 那边的 variables type 应该用 {a?:number}, output type 用 {a:number|null}
        // ? 其实就算 args 主要用于等号右侧, 它跟数据库类型也不是直接交互...可能还是 {a?:number} 好
        // ? 另外, apollo-server 会过滤 variables 中不存在的字段, 但不会补充 variables 中应该存在的字段为 null... 即对于 hello(name: String): String!
        // ? query({variables:{name:'xialvjun', wrong_field: 'asfasf'}}), resolver args 会是 {name:'xialvjun'} 而
        // ? query({variables:{}}), resolver args 会是 {}, 不会自作主张设置 args.name===null, 除非 query({variables:{name:null}})
        let real_type = real_get_type(it.type);
        if (real_type.endsWith(' | null')) {
          inter[it.name.value+'?'] = real_type.slice(0, -7);
        } else {
          inter[it.name.value] = real_get_type(it.type);
        }
      });
      lodash.merge(namespace, patch);
    },
    [graphql.Kind.INPUT_OBJECT_TYPE_EXTENSION]: node => {
      let patch = new_namespace();
      let inter = (patch.interfaces[node.name.value] = {});
      node.fields.map(it => {
        let real_type = real_get_type(it.type);
        if (real_type.endsWith(' | null')) {
          inter[it.name.value+'?'] = real_type.slice(0, -7);
        } else {
          inter[it.name.value] = real_get_type(it.type);
        }
      });
      lodash.merge(namespace, patch);
    },

    [graphql.Kind.OBJECT_TYPE_DEFINITION]: node => {
      current_object_type_name = node.name.value;
    },
    [graphql.Kind.OBJECT_TYPE_EXTENSION]: node => {
      current_object_type_name = node.name.value;
    },
    [graphql.Kind.FIELD_DEFINITION]: node => {
      if (node.arguments.length > 0) {
        let patch = new_namespace();
        let names = (patch.namespaces[current_object_type_name] = new_namespace());
        let inter = (names.interfaces[node.name.value] = {});
        node.arguments.map(it => {
          let real_type = real_get_type(it.type);
          if (real_type.endsWith(' | null')) {
            inter[it.name.value+'?'] = real_type.slice(0, -7);
          } else {
            inter[it.name.value] = real_get_type(it.type);
          }
        });
        lodash.merge(namespace, patch);
      }
    },

    [graphql.Kind.ENUM_TYPE_DEFINITION]: node => {
      let patch = new_namespace();
      let enu = (patch.enus[node.name.value] = {});
      node.values.map(it => (enu[it.name.value] = true));
      lodash.merge(namespace, patch);
    },
    [graphql.Kind.ENUM_TYPE_EXTENSION]: node => {
      let patch = new_namespace();
      let enu = (patch.enus[node.name.value] = {});
      node.values.map(it => (enu[it.name.value] = true));
      lodash.merge(namespace, patch);
    },
  });

  return namespace;
};

exports.stringify = namespace => {
  let enus_source = Object.keys(namespace.enus)
    .sort()
    .map(enu_name => {
      let enu = namespace.enus[enu_name];
      let enu_values = Object.keys(enu).sort();
      return `
export enum ${enu_name} {
  ${enu_values.map(it => `${it}="${it}",`).join('\n  ')}
}
`;
    })
    .join('');

  let interfaces_source = Object.keys(namespace.interfaces)
    .sort()
    .map(inter_name => {
      let inter = namespace.interfaces[inter_name];
      let inter_fields = Object.keys(inter).sort();
      return `
export interface ${inter_name} {
  ${inter_fields.map(fn => `${fn}: ${inter[fn]};`).join('\n  ')}
}
`;
    })
    .join('');

  let namespaces_source = Object.keys(namespace.namespaces)
    .sort()
    .map(ns_name => {
      let ns = namespace.namespaces[ns_name];
      return `
export namespace ${ns_name} {
${exports.stringify(ns).replace(/\n/g, '\n  ')}
}
`;
    })
    .join('');

  return enus_source + interfaces_source + namespaces_source;
};

const new_namespace = () => ({
  enus: {},
  interfaces: {},
  namespaces: {},
});

const get_type = t => {
  switch (t.kind) {
    case 'ListType':
      return `(${get_type(t.type)})[] | null`;
    case 'NonNullType':
      return get_type(t.type) + '-null';
    default:
      return (SCALAR[t.name.value] || t.name.value) + ' | null';
  }
};

const real_get_type = t => get_type(t).replace(/\s*\|\s*null\-null/g, '');
