import { Container } from "@radix-ui/themes";
import SellForm from "app/sell/SellForm";
import AuthWrapper from "@/core/components/AuthWrapper";

export default async function SellPage() {

  return (
    <AuthWrapper>
      <Container size={{ lg: "3", md: "3", sm: "1", xs: "1" }}>
        {" "}
        <SellForm />
      </Container>
    </AuthWrapper>
  );
  
}
