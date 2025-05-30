"use client";
import Link from "next/link";
import {useEffect, useActionState} from "react";
import {Group, Stack, TextInput, Anchor, Alert, Button} from "@mantine/core";
import {UserAvatarInput} from "@/components/user-avatar-input";
import {APP_PATHS} from "@/lib/app-paths";
import {notifications} from "@mantine/notifications";
import {updateProfileAction} from "../../actions/update-profile";

type Props = {
  userInfo: {
    name: string;
    email: string;
    username: string;
    avatar: string;
  };
};

export function ProfileUpdateForm({userInfo}: Props) {
  const [state, dispatch, isPending] = useActionState(updateProfileAction, {
    success: null,
  });
  const {username, name, avatar, email} = userInfo;

  useEffect(() => {
    if (state.success) {
      notifications.show({
        title: "بروزرسانی موفق",
        message: "پروفایل با موفقیت بروز شد",
        color: "green",
      });
    }
  }, [state, state.success]);

  return (
    <form action={dispatch}>
      <Group align="flex-start" justify="center">
        <UserAvatarInput userId={email} defaultValue={avatar} />
        <Stack flex={"1 1 300px"}>
          <TextInput
            type="text"
            name="name"
            defaultValue={name}
            error={state.fieldErrors?.name || ""}
          />
          <TextInput
            type="email"
            name="email"
            defaultValue={email}
            error={state.fieldErrors?.email || ""}
          />
          <TextInput
            name="username"
            type="text"
            defaultValue={username}
            error={state.fieldErrors?.username || ""}
          />
          <Alert>
            برای تغییر کلمه عبور از{" "}
            <Anchor
              component={Link}
              href={APP_PATHS.dashboard.profile.editPassword}
            >
              اینجا
            </Anchor>{" "}
            اقدام کنید
          </Alert>
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={isPending}>
              ویرایش پروفایل
            </Button>
          </Group>
        </Stack>
      </Group>
    </form>
  );
}
