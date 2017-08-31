// @flow
import type { RouteNode } from '../model/types'
import Navigation from '../model/Navigation'

export class TransitionFailure  {
  node: RouteNode<*, *>
  navigation: null | Navigation
  constructor(node: RouteNode<*, *>, navigation: ?Navigation) {
    this.node = node
    this.navigation = navigation || null
  }
}

export class NoMatch  {
  url: string
  constructor(url: string) {
    this.url = url
  }
  toString() {
    return `No match for ${this.url}`
  }
}

export class InvalidNavigation {
  transition: *
  constructor(transition: *) {
    this.transition = transition
  }
}
