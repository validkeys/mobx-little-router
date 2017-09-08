// @flow
import createRouteKey from './createRouteKey'
import type { Params, Query, Route, RouteStateTreeNode } from './types'

export default function createRoute<C: Object, D: Object>(node: RouteStateTreeNode<C, D>, segment: string, params: Params, query: Query): Route<C,D> {
  return {
    node: node,
    key: createRouteKey(node, segment, query),
    segment,
    params,
    query,
    context: node.value.getContext(),
    data: { ...node.value.getData(), transitionState: null },
    onTransition: node.value.onTransition
  }
}
