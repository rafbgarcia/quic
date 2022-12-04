import React, { useEffect, useState } from "react"
import { useAdmin } from "../lib/useAdmin"
import { Layout, Menu, Spin } from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/router"
const { Header, Sider, Content } = Layout

export default function AdminLayout({ children }: any) {
  const router = useRouter()
  const { loading, isLoggedIn } = useAdmin()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      window.location.href = "/login"
    }
  }, [loading, isLoggedIn])

  if (loading || !isLoggedIn) return <Spin />

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: "nav 1",
            },
            { key: "2", icon: <VideoCameraOutlined />, label: "nav 2" },
            {
              key: "3",
              icon: <UploadOutlined />,
              label: "Sair",
              onClick: () => {
                window.location.href = "/logout"
              },
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: "trigger",
            onClick: () => setCollapsed(!collapsed),
          })}
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  )
}
