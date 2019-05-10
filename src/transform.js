const graphql = require('graphql');

const { SCALAR } = require('./scalar');

let current_object_type_name = '';

exports.transform = (source) => {
  let gen_code = '';
  
  const ast = graphql.parse(source);

  graphql.visit(ast, {
    [graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION]: node => {
      // enter the "Kind" node
      gen_code += `
export interface ${node.name.value} {
  ${node.fields.map(f => {
    const field_name = f.name.value;
    const field_type = real_get_type(f.type);
    return `${field_name}: ${field_type};`
  }).join('\n  ')}
}
`;
    },

    [graphql.Kind.OBJECT_TYPE_DEFINITION]: node => {
      current_object_type_name = node.name.value;
    },
    [graphql.Kind.OBJECT_TYPE_EXTENSION]: node => {
      current_object_type_name = node.name.value;
    },
    [graphql.Kind.OBJECT_TYPE_DEFINITION]: node => {
      current_object_type_name = node.name.value;
    },

    [graphql.Kind.FIELD_DEFINITION]: node => {
      if (node.arguments.length > 0) {
        gen_code += `
export namespace ${current_object_type_name} {
  export interface ${node.name.value} {
    ${node.arguments.map(arg => {
      const arg_name = arg.name.value;
      const arg_type = real_get_type(arg.type);
      return `${arg_name}: ${arg_type};`
    }).join('\n    ')}
  }
}
`;
      }
    },

    [graphql.Kind.ENUM_TYPE_DEFINITION]: node => {
      gen_code += `
export enum ${node.name.value} {
  ${node.values.map(it => it.name.value + ',').join('\n  ')}
}
`;
    },

//     // union 是输出 type, 不能作为参数, 没必要生成对应 ts 类型
//     [graphql.Kind.UNION_TYPE_DEFINITION]: node => {
//       gen_code += `
// export type ${node.name.value} = ${node.types.map(it => it.name.value).join(' | ')};
// `;
//     },

  });

  return gen_code;
}

const get_type = t => {
  switch (t.kind) {
    case 'ListType':
      return `(${get_type(t.type)})[] | null`;
    case 'NonNullType':
      return get_type(t.type) + '-null';
    default:
      return (SCALAR[t.name.value] || t.name.value) + ' | null';
  }
}
const real_get_type = t => get_type(t).replace(/\s*\|\s*null\-null/g, '');
