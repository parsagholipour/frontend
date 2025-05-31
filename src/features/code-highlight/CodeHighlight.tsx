'use client'
import React, { useState, useCallback } from "react";
import {
  CodeHighlight as MantineCodeHighlight,
  CodeHighlightControl,
} from "@mantine/code-highlight";
import { IconPlayerPlay, IconLoader2 } from "@tabler/icons-react";
import { Paper, ScrollArea, Text } from "@mantine/core";
import {PUBLIC_BACKEND_URL} from "@/constants";
import {notifications} from "@mantine/notifications";

/**
 * <CodeHighlight />
 * -----------------
 * Extends Mantine's <CodeHighlight> with a “Run” control that
 *  • opens a WebSocket connection to `/api/ws/`
 *  • sends the code (Base‑64 encoded) in the expected JSON envelope
 *  • waits for the matching response, decodes it and shows the logs
 *
 * The server‑side contract (all messages are base‑64 encoded strings):
 *  ▶  {
 *       "id":        <uuid>,          // We generate this with crypto.randomUUID()
 *       "subject":   "runCode",
 *       "payload":   {
 *                      "runner": <runner‑id>, // e.g. "php‑8.4"
 *                      "code":   <source>
 *                    }
 *     }
 *  ◀  {
 *       "RequestID": <uuid>,          // Echo of our id
 *       "Payload":   {
 *                      "uuid":  <internal‑uuid>,
 *                      "name":  <same‑id>,
 *                      "logs":  <stdout + stderr>
 *                    }
 *     }
 */
function CodeHighlight({ code, language }) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  // Maps Prism/Mantine language tokens to the remote runner id
  const runnerFor = (lang) =>
    (
      {
        php: "php-8.4",
        javascript: "node-20",
        js: "node-20",
        typescript: "deno",
        ts: "deno",
        python: "python-3.12",
      }[lang?.toLowerCase()] || lang
    );

  /** Encodes/decodes UTF‑8 strings to/from base‑64 */
  const b64 = {
    enc: (str) => btoa(str),
    dec: (str) => {
      console.trace()
      console.log('wwww', str);
      return atob(str)
    },
  };

  const runCode = useCallback(() => {
    if (running) return; // de‑bounce

    setRunning(true);
    setOutput("");

    const id = crypto.randomUUID();
    const payload = {
      id,
      subject: "runCode",
      payload: {
        runner: runnerFor(language),
        code,
      },
    };

    const socket = new WebSocket(
      `${PUBLIC_BACKEND_URL.startsWith("https:") ? "wss" : "ws"}://${PUBLIC_BACKEND_URL.replace('https://', '').replace('http://', '')}/api/ws`
    );

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({
        ...payload,
        payload: b64.enc(JSON.stringify(payload.payload)),
      }));
    });

    socket.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        msg.Payload = JSON.parse(b64.dec(msg.Payload));
        console.log(msg);
        msg.Payload.logs = b64.dec(msg.Payload.logs);
        if (msg.RequestID === id) {
          setOutput(msg.Payload?.logs ?? "<no output>");
          socket.close(1000, "done");
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
        socket.close();
        notifications.show({
          title: "خطای غیرمنتظره",
          message: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
          color: "red",
        });
      } finally {
        setRunning(false);
      }
    });

    socket.addEventListener("error", (err) => {
      console.error("WebSocket error", err);
      setOutput(`WebSocket error: ${err.message ?? err}`);
      setRunning(false);
    });
  }, [code, language, running]);

  return (
    <>
      <MantineCodeHighlight
        mt="sm"
        mb="xl"
        code={code}
        language={language}
        copyLabel="کپی کردن"
        copiedLabel="کپی شد!"
        controls={[
          <CodeHighlightControl
            component="button"
            key="run"
            tooltipLabel={running ? "در حال اجرا…" : "اجرا"}
            disabled={running}
            onClick={runCode}
          >
            {running ? (
              <IconLoader2 style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <IconPlayerPlay />
            )}
          </CodeHighlightControl>,
        ]}
        styles={{
          code: {
            fontSize: 14,
          },
        }}
      />

      {/* Execution logs */}
      {output && (
        <Paper radius="md" p="md" withBorder>
          <Text fw={700} mb="xs">
            خروجی برنامه:
          </Text>
          <ScrollArea type="always" mah={260}>
            <MantineCodeHighlight code={output} language="" withCopyButton={false} />
          </ScrollArea>
        </Paper>
      )}
    </>
  );
}

export default CodeHighlight;
