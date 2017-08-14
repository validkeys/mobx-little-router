// @flow
import type { RouteValue, HookType } from './types'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import UrlPattern from 'url-pattern'
import type { LifecycleFn } from '../scheduling/types'

type Config = {
  path: string,
  data?: Object,
  children?: Config[],
  [HookType]: LifecycleFn[]
}

function alwaysContinue(__: *, ___: *) {
  return Promise.resolve()
}

export default function createRouteNode(config: Config): TreeNode<RouteValue> {
  return new TreeNode(
    {
      key: createKey(6),
      path: config.path,
      pattern: config.path !== '' ? new UrlPattern(config.path) : null,
      data: config.data || {},
      params: null,
      isActive: false,
      hooks: {
        canActivate: config.canActivate || [alwaysContinue],
        onEnter: config.onEnter || [alwaysContinue],
        onError: config.onError || [],
        onLeave: config.onLeave || [alwaysContinue],
        canDeactivate: config.canDeactivate || [alwaysContinue]
      }
    },
    config.children ? config.children.map(createRouteNode) : []
  )
}
