import classnames from "classnames"

export function _ButtonUnused({ children, size, ...props }: any) {
  size ||= "md"
  const classes = classnames(
    "leading-4 gap-2 inline-flex items-center rounded-lg border border-transparent bg-indigo-600 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    { "px-3 py-2 text-sm": size == "sm" },
    { "px-4 py-2 text-sm": size == "md" },
    { "px-4 py-2 text-base": size == "lg" },
    { "px-6 py-3 text-base": size == "xl" }
  )

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
