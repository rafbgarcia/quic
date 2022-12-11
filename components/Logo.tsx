import classNames from "classnames"

export const Logo = ({ className, ...props }: any) => (
  <span
    className={classNames(
      "block w-fit font-medium rounded-full px-4 py-1 text-sm bg-white border-gray-300 border text-gray-800",
      className
    )}
    {...props}
  >
    QuicLogo
  </span>
)
