"use client";
import {useActionState} from "react";
import Link from "next/link";
import {
  Paper,
  Stack,
  Group,
  TextInput,
  Alert,
  Anchor,
  Button,
} from "@mantine/core";
import {UserAvatarInput} from "@/components/user-avatar-input";
import {upsertUserAction} from "../../actions/upsert-user";
import {APP_PATHS} from "@/lib/app-paths";

type Props = {
  userInfo?: Partial<{
    userId: string;
    defaultAvatar: string;
    defaultName: string;
    defaultUsername: string;
    defaultEmail: string;
  }>;
};

export function UpsertUserForm({userInfo = {}}: Props) {
  const {userId, defaultUsername, defaultAvatar, defaultEmail, defaultName} =
    userInfo;
  const [state, dispatch, isPending] = useActionState(upsertUserAction, {
    success: true,
  });

  return (
    <Paper p={"xl"} withBorder>
      <form action={dispatch}>
        <Group justify="center" align="flex-start" gap={"xl"}>
          <UserAvatarInput defaultValue={defaultAvatar} userId={userId} />
          <Stack gap={"sm"} flex={1}>
            <TextInput
              name="name"
              label="نام"
              error={state.fieldErrors?.name}
              defaultValue={defaultName || ""}
            />
            <TextInput
              type="email"
              name="email"
              label="ایمیل"
              error={state.fieldErrors?.email}
              defaultValue={defaultEmail || ""}
            />
            <TextInput
              name="username"
              label="نام کاربری"
              error={state.fieldErrors?.username}
              defaultValue={defaultUsername || ""}
            />
            {userId === undefined && (
              <TextInput
                name="password"
                label="کلمه عبور"
                error={state.fieldErrors?.password}
              />
            )}
            {userId !== undefined && (
              <Alert mt={"xs"}>
                برای تغییر کلمه عبور از{" "}
                <Anchor
                  component={Link}
                  href={APP_PATHS.dashboard.users.editPassword(userId)}
                >
                  اینجا
                </Anchor>{" "}
                اقدام کنید
              </Alert>
            )}
            <input name="uuid" value={userId} readOnly hidden />
            <Group justify="flex-end" mt={userId ? "xs" : "lg"}>
              <Button type="submit" loading={isPending}>
                {userId === undefined ? "ذخیره کردن کاربر" : "بروزرسانی"}
              </Button>
            </Group>
          </Stack>
        </Group>
      </form>
    </Paper>
  );
}
