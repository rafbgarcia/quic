import React, { useState } from "react"
import { Layout, Menu } from "antd"
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
const { Header, Sider, Content } = Layout

export default function AdminLayout({ children }: any) {
  // const admin = useAdmin({ redirectTo: "/login" })
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu>
          <Menu.Item>
            <a href="/api/logout">Sair</a>
          </Menu.Item>
        </Menu>
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
