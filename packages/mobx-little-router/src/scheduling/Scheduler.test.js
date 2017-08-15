// @flow
import { toJS } from 'mobx'
import RouterStore from '../routing/RouterStore'
import Scheduler from './Scheduler'
import createRouteNode from '../routing/createRouteNode'

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = createScheduler(store)
  })

  describe('Scheduling and processing navigation', () => {
    test('Activation fails', async () => {
      const spy = jest.fn(() => Promise.reject('Nope'))
      const todosRootNode = store.state.root.children[1]
      store.updateNode(todosRootNode, {
        hooks: { canActivate: [spy] }
      })
      scheduler.scheduleNavigation({ pathname: '/todos' }, 'PUSH')

      await scheduler.processNavigation()

      // Navigation should be blocked.
      expect(store.location.pathname).toEqual('/')

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should not be called.
      expect(spy).toHaveBeenCalledTimes(1)
    })

    test('Activation successful', async () => {
      const spy = jest.fn(() => Promise.resolve())
      const rootNode = store.state.root
      const todosRootNode = store.state.root.children[1]
      const todosViewNode = store.state.root.children[1].children[1]
      store.updateNode(rootNode, { hooks: { canActivate: [spy] } })
      store.updateNode(todosRootNode, { hooks: { canActivate: [spy] } })
      store.updateNode(todosViewNode, { hooks: { canActivate: [spy] } })
      scheduler.scheduleNavigation({ pathname: '/todos/123' }, 'PUSH')

      await scheduler.processNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos/123/' })

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should be called.
      expect(spy).toHaveBeenCalledTimes(3)

      // Activation is called in bottom-up order.
      expect(spy.mock.calls[0][0]).toEqual(rootNode)
      expect(spy.mock.calls[1][0]).toEqual(todosRootNode)
      expect(spy.mock.calls[2][0]).toEqual(todosViewNode)

      // Matched params are passed to hook.
      expect(spy.mock.calls[2][1]).toEqual({ id: '123' })

      // Nodes are marked as active
      expect(store.activeNodes.length).toEqual(3)
      expect(store.activeNodes.map(node => node.value.path)).toEqual(['', 'todos', ':id'])
      expect(store.activeNodes.map(node => node.value.params)).toEqual([
        {},
        {},
        { id: '123' }
      ])
    })
  })

  test('Deactivation fails', async () => {
    const rootSpy = jest.fn(() => Promise.resolve())
    const viewSpy = jest.fn(() => Promise.reject())
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosViewNode = store.state.root.children[1].children[1]
    store.updateNode(todosRootNode, { hooks: { canDeactivate: [rootSpy] } })
    store.updateNode(todosViewNode, { hooks: { canDeactivate: [viewSpy] } })
    store.location.pathname = '/todos/123'
    store.activateNodes([rootNode, todosRootNode, todosViewNode])
    scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

    await scheduler.processNavigation()

    // Navigation should be processed.
    expect(toJS(store.location.pathname)).toEqual('/todos/123')

    // Navigation is cleared.
    expect(toJS(scheduler.navigation)).toBe(null)

    // Deactivation rejection blocks remaining nodes up the path.
    expect(rootSpy).not.toHaveBeenCalled()
    expect(viewSpy).toHaveBeenCalledTimes(1)
    expect(viewSpy.mock.calls[0][0]).toEqual(todosViewNode)
  })

  test('Deactivation successful', async () => {
    const spy = jest.fn(() => Promise.resolve())
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosViewNode = store.state.root.children[1].children[1]
    store.updateNode(todosRootNode, { hooks: { canDeactivate: [spy] } })
    store.updateNode(todosViewNode, { hooks: { canDeactivate: [spy] } })
    store.location.pathname = '/todos/123'
    store.activateNodes([rootNode, todosRootNode, todosViewNode])
    scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

    await scheduler.processNavigation()

    // Navigation should be processed.
    expect(toJS(store.location)).toEqual({ pathname: '/' })

    // Navigation is cleared.
    expect(toJS(scheduler.navigation)).toBe(null)

    // Deactivation hook is called.
    expect(spy).toHaveBeenCalledTimes(2)

    // Deactivation is called in bottom-up order.
    expect(spy.mock.calls[0][0]).toEqual(todosViewNode)
    expect(spy.mock.calls[1][0]).toEqual(todosRootNode)

    // Nodes are marked as active
    expect(store.activeNodes.length).toEqual(2)
    expect(store.activeNodes.map(node => node.value.path)).toEqual(['', ''])
  })

  test('Handling unmatched parts', async () => {
    scheduler.scheduleNavigation({ pathname: '/nope/nope/nope' }, 'PUSH')
    await scheduler.processNavigation()
    expect(store.location.pathname).toEqual('/')
    expect(store.error).toBeDefined()
    expect(store.error && store.error.toString()).toMatch(/No match/)
  })
})

function createStore() {
  const store = new RouterStore({ pathname: '/' })
  store.replaceChildren(store.state.root, [
    createRouteNode({
      path: '',
      children: []
    }),
    createRouteNode({
      path: 'todos',
      children: [
        {
          path: '',
          children: []
        },
        {
          path: ':id',
          children: []
        }
      ]
    })
  ])
  return store
}

function createScheduler(store) {
  return new Scheduler(store)
}