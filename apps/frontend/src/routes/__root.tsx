import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import Header from '../components/Header'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { useAuthStore } from '../store/authStore'

import type { QueryClient } from '@tanstack/react-query'

const TanStackDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-devtools').then((res) => ({
        default: res.TanStackDevtools,
      })),
    )

const TanStackRouterDevtoolsPanel = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtoolsPanel,
      })),
    )

function DevtoolsWithPlugins() {
  const [queryDevtools, setQueryDevtools] = useState<any>(null)

  useEffect(() => {
    if (!import.meta.env.PROD) {
      import('../integrations/tanstack-query/devtools').then((res) => {
        setQueryDevtools(res.default)
      })
    }
  }, [])

  return (
    <Suspense fallback={null}>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          queryDevtools,
        ].filter(Boolean)}
      />
    </Suspense>
  )
}

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
})

function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return null
}

function RootLayout() {
  return (
    <TanStackQueryProvider>
      <AuthInitializer />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full lg:w-[calc(100%-18rem)] relative">
          <Outlet />
        </main>
      </div>
      {!import.meta.env.PROD && <DevtoolsWithPlugins />}
    </TanStackQueryProvider>
  )
}
