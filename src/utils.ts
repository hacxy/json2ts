import ts from 'typescript';

/**
 * 分析 TypeScript 代码字符串中的类型依赖关系，返回排序后的代码和类型顺序
 * @param codeString TypeScript 代码字符串
 * @returns { sortedCode: string; sortedTypes: string[] } 排序后的代码和类型顺序
 */
export function analyzeAndSortTypeScript(codeString: string): { sortedCode: string; sortedTypes: string[] } {
  // 创建虚拟源文件
  const sourceFile = ts.createSourceFile('virtual.ts', codeString, ts.ScriptTarget.Latest, true);

  // 存储类型节点和依赖关系
  const typeNodes = new Map<string, ts.Node>();
  const dependencies = new Map<string, string[]>();
  const definedTypes = new Set<string>();
  const nodeTexts = new Map<string, string>();

  // 第一遍遍历：收集所有定义的类型
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const typeName = node.name.getText(sourceFile);
      definedTypes.add(typeName);
      typeNodes.set(typeName, node);
      // 保存节点完整文本（包括注释）
      nodeTexts.set(typeName, node.getFullText(sourceFile).trim());
    }
  });

  // 第二遍遍历：收集依赖关系
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const typeName = node.name.getText(sourceFile);
      const deps: Set<string> = new Set(); // 使用 Set 避免重复依赖

      // 递归查找类型引用
      const findTypeReferences = (n: ts.Node) => {
        // 处理类型引用
        if (ts.isTypeReferenceNode(n)) {
          const refName = n.typeName.getText(sourceFile);
          if (definedTypes.has(refName) && refName !== typeName) {
            deps.add(refName);
          }
        }
        // 处理数组类型 (如 RootElement[])
        else if (ts.isArrayTypeNode(n)) {
          findTypeReferences(n.elementType);
        }
        // 处理联合类型 (A | B)
        else if (ts.isUnionTypeNode(n)) {
          n.types.forEach(findTypeReferences);
        }
        // 处理交叉类型 (A & B)
        else if (ts.isIntersectionTypeNode(n)) {
          n.types.forEach(findTypeReferences);
        }
        // 处理接口属性 (a: B)
        else if (ts.isPropertySignature(n) && n.type) {
          findTypeReferences(n.type);
        }
        // 处理方法签名 (method(): B)
        else if (ts.isMethodSignature(n) && n.type) {
          findTypeReferences(n.type);
        }
        // 处理索引签名 ([key: string]: B)
        else if (ts.isIndexSignatureDeclaration(n) && n.type) {
          findTypeReferences(n.type);
        }

        // 递归遍历所有子节点
        ts.forEachChild(n, findTypeReferences);
      };

      // 对于类型别名，遍历其类型节点
      if (ts.isTypeAliasDeclaration(node) && node.type) {
        findTypeReferences(node.type);
      }

      // 对于接口，遍历其成员
      if (ts.isInterfaceDeclaration(node)) {
        node.members.forEach((member) => {
          findTypeReferences(member);
        });
      }

      // 对于接口，检查继承的接口
      if (ts.isInterfaceDeclaration(node) && node.heritageClauses) {
        node.heritageClauses.forEach((clause) => {
          clause.types.forEach((type) => {
            const baseName = type.expression.getText(sourceFile);
            if (definedTypes.has(baseName) && baseName !== typeName) {
              deps.add(baseName);
            }
          });
        });
      }

      dependencies.set(typeName, Array.from(deps));
    }
  });

  // 拓扑排序（确保依赖在前）
  const sortedTypes: string[] = [];
  const visited = new Map<string, boolean>();
  const visiting = new Set<string>();
  const cycles: string[][] = [];

  const visit = (typeName: string, path: string[] = []) => {
    if (visited.has(typeName)) return;

    if (visiting.has(typeName)) {
      // 检测到循环依赖，记录循环路径
      const cycleStart = path.indexOf(typeName);
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart));
      }
      return;
    }

    visiting.add(typeName);
    const newPath = [...path, typeName];

    // 处理所有依赖项
    const deps = dependencies.get(typeName) || [];
    for (const dep of deps) {
      visit(dep, newPath);
    }

    visiting.delete(typeName);
    visited.set(typeName, true);
    sortedTypes.push(typeName);
  };

  // 对每个类型进行排序
  dependencies.forEach((_, typeName) => {
    if (!visited.has(typeName)) {
      visit(typeName);
    }
  });

  // 处理循环依赖 - 将循环依赖的类型放在一起
  cycles.forEach((cycle) => {
    // 找出循环中第一个出现在排序列表中的位置
    const insertIndex = sortedTypes.findIndex((t) => cycle.includes(t));
    if (insertIndex !== -1) {
      // 移除循环中的所有类型
      cycle.forEach((type) => {
        const index = sortedTypes.indexOf(type);
        if (index !== -1) sortedTypes.splice(index, 1);
      });

      // 将循环组作为一个整体插入
      sortedTypes.splice(insertIndex, 0, ...cycle);
    }
  });

  // 收集非类型定义代码部分
  const nonTypeCode: string[] = [];
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node)) {
      nonTypeCode.push(node.getFullText(sourceFile));
    }
  });

  // 构建排序后的类型定义代码
  const sortedTypeCode = sortedTypes
    .map((type) => nodeTexts.get(type))
    .filter(Boolean)
    .join('\n\n');

  // 组合最终代码：排序的类型定义 + 非类型代码
  const sortedCode = `${sortedTypeCode}\n\n${nonTypeCode.join('')}`;

  return {
    sortedCode,
    sortedTypes
  };
}
