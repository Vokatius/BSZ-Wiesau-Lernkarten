import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { IconMenu, IconX } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { CreateFolderModal } from "./create-folder-modal";
import { LeftNav } from "./navbar/left-nav";
import { MobileMenu } from "./navbar/mobile-menu";
import { UserMenu } from "./navbar/user-menu";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const onStaticPage = router.pathname === "/" || router.pathname === "/404";

  const { data: session, status } = useSession();
  const { isOpen: isMobileMenuOpen, onToggle: onMobileMenuToggle } =
    useDisclosure();

  const [folderModalOpen, setFolderModalOpen] = React.useState(false);

  return (
    <>
      <CreateFolderModal
        isOpen={folderModalOpen}
        onClose={() => {
          setFolderModalOpen(false);
        }}
      />
      <Flex pos="relative" zIndex={100} w="full">
        <HStack
          as="header"
          aria-label="Main navigation"
          maxW={onStaticPage ? "7xl" : undefined}
          w="full"
          mx="auto"
          px={{ base: "6", md: "8" }}
          py="4"
          justify="space-between"
        >
          <LeftNav onFolderClick={() => setFolderModalOpen(true)} />
          <Box display={["block", "block", "none"]}>
            <IconButton
              aria-label={"Open menu"}
              icon={
                isMobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />
              }
              variant="ghost"
              colorScheme="gray"
              onClick={onMobileMenuToggle}
            />
            <MobileMenu isOpen={isMobileMenuOpen} />
          </Box>
          <HStack
            as="nav"
            spacing={4}
            display={["none", "none", "flex"]}
            height="12"
          >
            {session?.user && <UserMenu />}
            {status !== "loading" && !session && (
              <Button
                colorScheme="blue"
                fontWeight={700}
                onClick={async () => {
                  await signIn("google", {
                    callbackUrl: "/home",
                  });
                }}
              >
                Sign in
              </Button>
            )}
          </HStack>
        </HStack>
      </Flex>
    </>
  );
};
