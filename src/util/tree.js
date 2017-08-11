// @flow

export class TreeNode<T> {
  value: T
  children: TreeNode<T>[]

  constructor(value: T, children: TreeNode<T>[]) {
    this.value = value
    this.children = children
  }
}


type Visitor<T> = (n: TreeNode<T>, segment: string) => Promise<boolean>

// Asynchronous DFS from root node for a matching path based on return of visitor function.
export async function findPath<T>(visitor: Visitor<T>, node: TreeNode<T>, path: string[]): Promise<TreeNode<T>[]> {
  const [ curr, ...rest ] = path

  // No more segments to parse.
  if (curr === undefined) {
    return []
  }

  const result = await visitor(node, curr)

  if (result) {
    for (const child of node.children) {
      const path = await findPath(visitor, child, rest)
      if (path.length > 0) {
        path.unshift(node)
        return path
      }
    }
    return [node]
  }

  // Nothing matched here.
  return []
}
