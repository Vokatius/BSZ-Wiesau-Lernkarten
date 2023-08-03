import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@quenti/env/client";
import type { MembershipRole } from "@quenti/prisma/client";
import { IconLink, IconUpload, IconUser, IconUsers } from "@tabler/icons-react";
import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { AnimatedCheckCircle } from "../../components/animated-icons/check";
import { AutoResizeTextarea } from "../../components/auto-resize-textarea";
import { Modal } from "../../components/modal";
import { useOrganization } from "../../hooks/use-organization";
import { api } from "@quenti/trpc";
import { MemberRoleSelect } from "./member-role-select";

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  token?: string;
}

interface InviteMemberFormInputs {
  emails: string | string[];
  role: MembershipRole;
  sendEmails: boolean;
}

const requiredEmail = z
  .string()
  .nonempty({ message: "Email is required" })
  .email({ message: "Enter a valid email" });

const schema = z.object({
  emails: z.union([
    requiredEmail,
    z.array(requiredEmail).nonempty("Emails are required"),
  ]),
  role: z.enum(["Member", "Admin", "Owner"]),
  sendEmails: z.boolean(),
});

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  orgId,
  token,
}) => {
  const org = useOrganization();
  const utils = api.useContext();
  const toast = useToast();

  const inviteMemberFormMethods = useForm<InviteMemberFormInputs>({
    defaultValues: {
      emails: "",
      role: "Member",
      sendEmails: true,
    },
    resolver: zodResolver(schema),
  });
  const {
    formState: { errors },
  } = inviteMemberFormMethods;

  const inviteMember = api.organizations.inviteMember.useMutation({
    onSuccess: async () => {
      await utils.organizations.get.invalidate();
      onClose();
    },
  });

  const createInvite = api.organizations.createInvite.useMutation({
    onSuccess: async (token) => {
      await copyInviteLink(token);
      await utils.organizations.get.invalidate();
    },
  });

  const copyInviteLink = async (providedToken?: string) => {
    await navigator.clipboard.writeText(
      `${env.NEXT_PUBLIC_BASE_URL}/orgs?token=${providedToken || token || ""}`
    );
    toast({
      title: "Invite link copied to clipboard",
      status: "success",
      icon: <AnimatedCheckCircle />,
      containerStyle: { marginBottom: "2rem", marginTop: "-1rem" },
    });
  };

  const handleFileUpload = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e?.target?.result as string;
      const emails = content
        ?.split(",")
        .map((email) => email.trim().toLowerCase());
      inviteMemberFormMethods.setValue("emails", emails);
    };

    reader.readAsText(target.files[0]!);
  };

  const onSubmit: SubmitHandler<InviteMemberFormInputs> = async (data) => {
    await inviteMember.mutateAsync({
      orgId,
      emails: Array.isArray(data.emails) ? data.emails : [data.emails],
      role: data.role,
      sendEmail: data.sendEmails,
    });
  };

  const [tabIndex, setTabIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) {
      setTabIndex(0);
      inviteMemberFormMethods.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const importRef = React.useRef<HTMLInputElement | null>(null);

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverColor = useColorModeValue("gray.50", "gray.750");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <form onSubmit={inviteMemberFormMethods.handleSubmit(onSubmit)}>
        <Modal.Content>
          <Modal.Body>
            <Modal.Heading>Invite organization members</Modal.Heading>
            <Stack spacing="6">
              <Tabs
                w="full"
                variant="unstyled"
                tabIndex={tabIndex}
                onChange={(i) => setTabIndex(i)}
              >
                <Stack spacing="6">
                  <TabList
                    w="full"
                    border="solid 1px"
                    rounded="lg"
                    borderColor={borderColor}
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      w="50%"
                      h="full"
                      p="1"
                      transition="transform 0.3s ease-in-out"
                      style={{
                        transform: `translateX(${tabIndex === 0 ? 0 : "100%"})`,
                      }}
                      zIndex={10}
                    >
                      <Box
                        background={borderColor}
                        w="full"
                        h="full"
                        rounded="md"
                      />
                    </Box>
                    <Tab
                      w="full"
                      fontSize="sm"
                      fontWeight={600}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        role="group"
                        top="0"
                        left="0"
                        w="full"
                        h="full"
                        p="1"
                      >
                        <Box
                          transition="background 0.15s ease-in-out"
                          rounded="md"
                          w="full"
                          h="full"
                          _groupHover={{
                            background: hoverColor,
                          }}
                        />
                      </Box>
                      <HStack zIndex={20} pointerEvents="none">
                        <IconUser size={16} />
                        <Text>Invite individual</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      w="full"
                      fontSize="sm"
                      fontWeight={600}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        role="group"
                        top="0"
                        left="0"
                        w="full"
                        h="full"
                        p="1"
                      >
                        <Box
                          transition="background 0.15s ease-in-out"
                          rounded="md"
                          w="full"
                          h="full"
                          _groupHover={{
                            background: hoverColor,
                          }}
                        />
                      </Box>
                      <HStack zIndex={20} pointerEvents="none">
                        <IconUsers size={16} />
                        <Text>Bulk import</Text>
                      </HStack>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p="0">
                      <Controller
                        name="emails"
                        control={inviteMemberFormMethods.control}
                        render={({ field: { value, onChange } }) => (
                          <FormControl isInvalid={!!errors.emails}>
                            <FormLabel>Email</FormLabel>
                            <Input
                              placeholder="email@example.com"
                              defaultValue={value}
                              onChange={(e) => onChange(e.target.value)}
                            />
                            <FormErrorMessage>
                              {errors.emails?.message}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      />
                    </TabPanel>
                    <TabPanel p="0">
                      <Stack spacing="4">
                        <Controller
                          name="emails"
                          control={inviteMemberFormMethods.control}
                          render={({ field: { value, onChange } }) => (
                            <FormControl isInvalid={!!errors.emails}>
                              <FormLabel>Invite via email</FormLabel>
                              <AutoResizeTextarea
                                allowTab={false}
                                placeholder="email-one@example.com, email-two@example.com"
                                minH="120px"
                                defaultValue={value}
                                onChange={(e) => {
                                  const values = e.target.value
                                    .toLowerCase()
                                    .split(",");

                                  const emails =
                                    values.length == 1
                                      ? values[0]!.trim()
                                      : values.map((v) => v.trim());

                                  onChange(emails);
                                }}
                              />
                              <FormErrorMessage>
                                {errors.emails?.message}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        />
                        <Button
                          variant="outline"
                          colorScheme="gray"
                          leftIcon={<IconUpload size={18} />}
                          onClick={() => {
                            if (importRef.current) importRef.current.click();
                          }}
                        >
                          Upload a .csv file
                        </Button>
                        <input
                          ref={importRef}
                          hidden
                          id="bulkImport"
                          type="file"
                          accept=".csv"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e) handleFileUpload(e);
                          }}
                        />
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Stack>
              </Tabs>
              <Controller
                name="role"
                control={inviteMemberFormMethods.control}
                render={({ field: { value, onChange } }) => (
                  <FormControl>
                    <FormLabel>Invite as</FormLabel>
                    <MemberRoleSelect
                      value={value}
                      onChange={onChange}
                      myRole={org?.me.role || "Admin"}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="sendEmails"
                control={inviteMemberFormMethods.control}
                render={({ field: { onChange } }) => (
                  <FormControl>
                    <Checkbox
                      defaultChecked
                      onChange={(e) => onChange(e.target.checked)}
                    >
                      Send an invite email
                    </Checkbox>
                  </FormControl>
                )}
              />
            </Stack>
          </Modal.Body>
          <Modal.Divider />
          <Modal.Footer>
            <Flex justifyContent="space-between" w="full">
              <Button
                variant="link"
                leftIcon={<IconLink size={18} />}
                onClick={async () => {
                  if (token) {
                    await copyInviteLink();
                  } else {
                    await createInvite.mutateAsync({ orgId });
                  }
                }}
                isLoading={createInvite.isLoading}
              >
                Copy invite link
              </Button>
              <ButtonGroup>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={inviteMember.isLoading}
                >
                  Invite
                </Button>
              </ButtonGroup>
            </Flex>
          </Modal.Footer>
        </Modal.Content>
      </form>
    </Modal>
  );
};