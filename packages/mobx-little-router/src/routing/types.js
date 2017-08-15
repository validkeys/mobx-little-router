// @flow
import UrlPattern from 'url-pattern'
import type { LifecycleFn } from '../scheduling/types'
import { TreeNode } from '../util/tree'
import type { History, Location as HistoryLocation } from 'history'

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>

export type Href = Location | string

export type Config = {
  path: string,
  data?: Object,
  children?: Config[],
  [HookType]: LifecycleFn[]
}

export const HookTypes = {
  canActivate: 'canActivate',
  onEnter: 'onEnter',
  onLeave: 'onLeave',
  canDeactivate: 'canDeactivate',
  onError: 'onError'
}

export type HookType = $Keys<typeof HookTypes>

export type Hooks = { [HookType]: LifecycleFn[] }

export type RouteValue = {
  key: string,
  // Original path provided to this route node.
  path: string,
  // Pattern to match segments with.
  pattern: null | UrlPattern,
  // Matched path parameters.
  params: null | Params,
  // Extra data that can be used to provide view specific functionality.
  // e.g. Route component, loading component, etc.
  data: Object,
  // Allows us to keep track of activated and deactivated states.
  isActive: boolean,
  // Lifecycle utilities
  hooks: Hooks
}

export type RouteNode = TreeNode<RouteValue>