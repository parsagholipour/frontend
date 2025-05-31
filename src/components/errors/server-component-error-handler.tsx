'use client'
import React, {useEffect} from "react";
import {notifications} from "@mantine/notifications";

function ServerComponentErrorHandler({state}) {
  useEffect(() => {
    if (state?.success === false) {
      notifications.show({
        title: "عملیات به مشکل خورد",
        color: "red",
      });
    }
  }, [state]);
}

export default ServerComponentErrorHandler;
