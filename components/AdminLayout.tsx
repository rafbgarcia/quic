import { Dialog, Menu, Transition } from "@headlessui/react"
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/20/solid"
import { Bars3Icon, QueueListIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { message } from "antd"
import classNames from "classnames"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { Avatar } from "./Avatar"

const navigation = [{ name: "Códigos", href: "/admin", icon: QueueListIcon }]

export default function AdminLayout({ children }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => {
    if (router.query.message) {
      messageApi.info(router.query.message)
    }
  }, [messageApi, router.query.message])

  return (
    <>
      {contextHolder}
      <div className="h-[100vh] bg-white">
        <div className="flex h-full">
          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
              </Transition.Child>

              <div className="fixed inset-0 z-40 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                          type="button"
                          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="sr-only">Close sidebar</span>
                          <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                      <Sidebar />
                    </div>
                    <CurrentAdmin />
                  </Dialog.Panel>
                </Transition.Child>
                <div className="w-14 flex-shrink-0" aria-hidden="true">
                  {/* Force sidebar to shrink to fit close icon */}
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex w-64 flex-col">
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-gray-100">
                <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                  <Sidebar />
                </div>
                <CurrentAdmin />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="lg:hidden">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5">
                <div>{/* <Logo /> */}</div>
                <div>
                  <button
                    type="button"
                    className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative z-0 flex flex-1 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}

function Sidebar() {
  const router = useRouter()
  return (
    <>
      <div className="flex flex-shrink-0 items-center px-4">{/* <Logo /> */}</div>

      <nav aria-label="Sidebar" className="mt-5">
        <div className="space-y-1 px-2">
          <div className="mb-5 flex flex-1 flex-col pt-1">
            {/* User account dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="group w-full rounded-md bg-gray-100 px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <span className="flex w-full items-center justify-between">
                    <span className="flex min-w-0 items-center justify-between space-x-3">
                      <Avatar />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-gray-900">Empresa 1</span>
                        <span className="truncate text-sm text-gray-500">Ativo</span>
                      </span>
                    </span>
                    <ChevronUpDownIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 left-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="text-sm italic text-gray-500 px-4 py-2">Sem outros negócios</div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "px-4 py-2 text-sm flex items-center"
                          )}
                        >
                          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          Cadastrar Negócio
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames("group flex items-center px-2 py-2 text-base font-medium rounded-md", {
                "bg-gray-200 text-gray-900": item.href === router.pathname,
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900": item.href !== router.pathname,
              })}
            >
              <item.icon
                className={classNames("mr-4 h-6 w-6", {
                  "text-gray-500": item.href === router.pathname,
                  "text-gray-400 group-hover:text-gray-500": item.href !== router.pathname,
                })}
                aria-hidden="true"
              />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}

function CurrentAdmin() {
  return (
    <>
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            <Avatar />
          </div>
          <div className="ml-3">
            <p className="text-base font-medium text-gray-700">Administrador</p>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:underline">
              Editar perfil
            </Link>
            <span className="text-gray-500 mx-2">•</span>
            <Link href="/api/logout" className="text-sm font-medium text-gray-500 hover:underline">
              Sair
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
