import { useRef, useState, type FormEvent } from "react";

type Methods = "password" | "webauthn" | "totp" | "server";

const methodsPlaceholder: Record<Methods, string> = {
  password: "password here...",
  webauthn: "",
  totp: "TOTP code here...",
  server: "Server code here...",
}

export function Authenticator() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const challengeID = useRef<string|null>(null);
  const [method, setMethod] = useState<Methods>("password");

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      const url = new URL(endpoint, location.href);
      const method = formData.get("method") as string;
      const res = await fetch(url, { method });

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  };

  const challenge = async () => {
    const response = await fetch("/server_auth/challange", { method: "post" });
    const id = await response.json() as string;
    challengeID.current = id;
  };

  return (
    <div className="authenticator">
      <form onSubmit={login} className="endpoint-row">
        <select name="method" className="method" value={method} onChange={e=>setMethod(e.target.value as any)}>
          <option value="password">Password</option>
          <option value="webauthn">WebAuthn</option>
          <option value="totp">TOTP</option>
          <option value="server">Server</option>
        </select>
        {method === "server" && <button type="button" className="challange-button" onClick={challenge}>Challange</button>}
        {method !== "webauthn" &&
          <input type={method === "password" ? "password" : "text"} name="pass" className="input" placeholder={methodsPlaceholder[method]} />}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <textarea ref={responseInputRef} readOnly placeholder="Response will appear here..." className="response-area" />
    </div>
  );
}
