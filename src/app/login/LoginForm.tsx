"use client";
import {
  Button,
  Card,
  Flex,
  Text,
  Container,
  TextField,
  IconButton,
} from "@radix-ui/themes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  EnvelopeClosedIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

type StateI = {
  email: string;
  password: string;
  error: string;
  isVisible: boolean;
};

const initialState = {
  email: "",
  password: "",
  error: "",
  isVisible: false,
};

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [state, setState] = useState<StateI>(initialState);
  const { email, password, error, isVisible } = state;
  const handleSignUp = async () => {
    if (email && password) {
      const data = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/signup/`,
        },
      });
      if (data.error) {
        console.log(data.error)
        setState((prevState) => ({
          ...prevState,
          error: data.error.message,
        }));
      } else {
        router.refresh();
      }
    }else{
      setState((prevState) => ({
        ...prevState,
        error: "Por favor, asegurate de llenar todos los campos",
      }));
    }
  };

  const handleLogin = async () => {
    if (email && password) {
      const data = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.error) {
        setState((prevState) => ({
          ...prevState,
          error: "Credenciales invalidas, intentalo de nuevo",
        }));
      } else {
        router.refresh();
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        error: "Por favor, asegurate de llenar todos los campos",
      }));
    }
  };

  const handleOnChange =
    (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setState((prevState) => ({
        ...prevState,
        [fieldName]: event.target.value,
      }));
    };

  const passwordToggle = () => {
    setState((prevState) => ({
      ...prevState,
      isVisible: !prevState.isVisible,
    }));
  };
  useEffect(() => {
    if (email || password) {
      setState((prevState) => ({
        ...prevState,
        error: "",
      }));
    }
  }, [email, password]);
  return (
    <Container size={{ lg: "1", md: "1", sm: "1", xs: "1" }} mt={"9"}>
      <Card>
        <Flex gap={"3"} direction={"column"}>
          <Text align={"center"}>Inicia sesión o registrate</Text>
          <TextField.Root>
            <TextField.Slot>
              <EnvelopeClosedIcon />
            </TextField.Slot>
            <TextField.Input
              size={"3"}
              name="email"
              id="email"
              value={email}
              type="email"
              onChange={handleOnChange("email")}
              placeholder="Email"
            />
          </TextField.Root>
          <TextField.Root>
            <TextField.Slot>
              <LockClosedIcon />
            </TextField.Slot>
            <TextField.Input
              size={"3"}
              name="password"
              id="password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={handleOnChange("password")}
              placeholder="Contraseña"
            />
            <TextField.Slot>
              <IconButton variant={"ghost"} onClick={passwordToggle}>
                {isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
          {error && (
            <Text size={"1"} color="crimson">
              {error}
            </Text>
          )}
          <Button variant={"solid"} onClick={handleLogin}>
            Iniciar Sesión
          </Button>
          <Button variant={"surface"} onClick={handleSignUp}>
            Registrarme
          </Button>
          <Text as={"p"} size={"1"} align={"center"}>
            Recuperar contraseña
          </Text>
        </Flex>
      </Card>
    </Container>
  );
}
