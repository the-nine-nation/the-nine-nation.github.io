import Link from "next/link";
import type { ChatGPTUser } from "../app/chatgpt-auth";
import { chatGPTSignInPath, chatGPTSignOutPath } from "../app/chatgpt-auth";

export function SiteHeader({ user, role }: { user: ChatGPTUser | null; role?: string }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="人类说明书首页">
        <span className="brand-orbit" aria-hidden="true">※</span>
        <span>人类说明书</span>
        <small>野生版</small>
      </Link>
      <nav className="header-nav" aria-label="主导航">
        <Link href="/journey">我到底哪根筋</Link>
        {user ? (
          <>
            <Link href="/dashboard">我的说明书</Link>
            {role === "admin" ? <Link href="/admin">人类观察室</Link> : null}
            <a className="avatar-link" href={chatGPTSignOutPath("/")} title="退出登录">
              <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
              <em>{user.displayName}</em>
            </a>
          </>
        ) : (
          <a className="mini-button" href={chatGPTSignInPath("/dashboard")}>登录 / 注册</a>
        )}
      </nav>
    </header>
  );
}
