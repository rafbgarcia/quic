import { GetServerSidePropsContext } from "next"

export async function getServerSideProps({ query, req }: GetServerSidePropsContext) {
  const code = query.code as string
  return {
    props: { code },
  }
}

export default function Code({ code }: any) {
  return <p>{code}</p>
}
