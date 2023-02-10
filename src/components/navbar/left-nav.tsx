import {
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconBooks, IconChevronDown, IconCloudDownload, IconFolder } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { Logo } from "../../icons/logo";
import { MenuOption } from "../menu-option";

export interface LeftNavProps {
  onFolderClick: () => void;
  onImportClick: () => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({ onFolderClick, onImportClick }) => {
  const session = useSession()!.data!;

  const menuBg = useColorModeValue("white", "gray.800");

  return (
    <HStack as="nav" spacing={4} height="12">
      <Flex
        align="center"
        justify="space-between"
        className="nav-content__mobile"
        color="white"
      >
        <HStack as={Link} href="/" rel="home" ml="2">
          <Logo boxSize="35px" />
          <Heading
            as="p"
            fontSize="lg"
            color={useColorModeValue("black", "white")}
          >
            Quizlet.cc
          </Heading>
        </HStack>
      </Flex>
      {session?.user && (
        <HStack display={["none", "none", "flex"]}>
          <Button
            as={Link}
            href="/home"
            variant="ghost"
            colorScheme="gray"
            fontWeight={700}
            fontSize="sm"
          >
            Home
          </Button>
          {session?.user?.admin && (
            <Button
              as={Link}
              href="/admin"
              variant="ghost"
              colorScheme="gray"
              fontWeight={700}
              fontSize="sm"
            >
              Admin
            </Button>
          )}
          <Menu placement="bottom-start">
            <MenuButton>
              <Button
                fontWeight={700}
                fontSize="sm"
                rightIcon={<IconChevronDown />}
                as="div"
              >
                Create
              </Button>
            </MenuButton>
            <MenuList
              bg={menuBg}
              py={0}
              overflow="hidden"
              w="max"
              marginTop={2}
            >
              <MenuOption
                icon={<IconBooks size={20} />}
                label="Study set"
                link="/create"
              />
              <MenuOption
                icon={<IconCloudDownload size={20} />}
                label="Import from Quizlet"
                onClick={onImportClick}
              />
              <MenuOption
                icon={<IconFolder size={20} />}
                label="Folder"
                onClick={onFolderClick}
              />
            </MenuList>
          </Menu>
        </HStack>
      )}
    </HStack>
  );
};
