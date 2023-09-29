"use client";

import { Flex, Grid, Text, Button, Box } from "@radix-ui/themes";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.svg";
import { useRouter } from "next/navigation";
import { ExitIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useClientAuth } from "@/core/hooks/useClientAuth";
import { noSSR } from "next/dynamic";
export const dynamic = "force-dynamic";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const auth = useClientAuth()
  
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    // router.push("/auth/login");
    router.refresh()
  }
  const goToSell = () => {
    // router.push(`${auth ? '/sell' : '/auth/login'}`);
    router.push('/sell');
  };

  
  return (
    <Grid
      position={"fixed"}
      top={"0"}
      left={"0"}
      className="black-background z-index-1"
      width={"100%"}
      columns={"3"}
      height={"9"}
    >
      <Link href={"/"} as={"/"} className="no-underline">
        <Flex
          width={"100%"}
          height={"100%"}
          justify={"center"}
          //mt={{ sm: "2", xs: "2", initial: "2" }}
          mr={{ sm: "2", xs: "2", initial: "2" }}
          align={"center"}
          ml={{ xl: "9", lg: "7", md: "5", sm: "5", xs: "5", initial: "3" }}
          gap={"2"}
        >
          <Image src={logo} width={30} height={30} alt="WiseMeeple" />
          <Text
            align={"center"}
            weight={"bold"}
            size={{ lg: "5", md: "5", sm: "5", xs: "3" }}
          >
            WiseMeeple
          </Text>
        </Flex>
      </Link>
      <Box></Box>
      <Flex align={"center"} direction={"row"} gap={"4"}>
        <Button onClick={goToSell} size={{ lg: "2", md: "2", initial: "1" }}>
          Vender Juegos
        </Button>
        {auth && (
          <Button size={{ lg: "2", md: "2", initial: "1" }} variant="outline" onClick={handleLogOut}>
            {" "}
            <ExitIcon />
            Logout{" "}
          </Button>
        )}
        
      </Flex>
    </Grid>
  );
}
