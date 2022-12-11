import { Disclosure, Menu, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { UserIcon } from "@heroicons/react/24/solid"
import { Alert } from "antd"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { Logo } from "./Logo"

const user = {
  name: "Rafael Garcia",
  email: "rafbgarcia@gmail.com",
}
const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Nova cobrança", href: "/admin/charges/new" },
]
const userNavigation = [{ name: "Sair", href: "/api/logout" }]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const Avatar = (
  <span className="inline-flex items-center justify-center rounded-full bg-white border border-gray-300">
    <UserIcon className="w-6 text-gray-400" />
  </span>
)

export default function AdminLayout({
  children,
  pageTitle,
  disableMenu,
}: {
  children: any
  pageTitle: string
  disableMenu?: boolean
}) {
  const router = useRouter()

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-indigo-600">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Logo />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {!disableMenu &&
                          navigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                item.href == router.pathname
                                  ? "bg-indigo-700 text-white"
                                  : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                                "px-3 py-2 rounded-md text-sm font-medium"
                              )}
                              aria-current={item.href == router.pathname ? "page" : undefined}
                            >
                              {item.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button
                            type="button"
                            className="flex max-w-xs items-center rounded-full bg-indigo-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                          >
                            <span className="sr-only">Open user menu</span>
                            {Avatar}
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
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.href == router.pathname
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.href == router.pathname ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-indigo-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">{Avatar}</div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user.name}</div>
                      <div className="text-sm font-medium text-indigo-300">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">{pageTitle}</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {router.query.message && (
            <Alert className="mb-6" showIcon message={router.query.message} type="warning" />
          )}
          {children}
        </main>
        <footer className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
            <span className="block sm:inline">&copy; 2023 Quic.</span>{" "}
            <span className="block sm:inline">Todos os direitos reservados.</span>
          </div>
        </footer>
      </div>
    </>
  )
}
