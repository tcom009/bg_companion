import { config } from "config";
import { createPrompt } from "@/core/lib/createPrompt";
import { fullGameParser } from "@/core/lib/fullGameParser";
import getSingleGame from "core/lib/getGame";
import { trimAndClean } from "@/core/lib/textUtils";
import embeddingGenerator from "core/lib/getVectors";
import RecommendationList from "./RecommendationList";
import {
  Container,
  Avatar,
  Flex,
  Text,
  Heading,
} from "@radix-ui/themes";
import Link from "next/link";
import {
  ExternalLinkIcon,
  PersonIcon,
  CalendarIcon,
  Pencil1Icon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export default async function Page({ params }: { params: { id: string } }) {
  const gameId = params.id;
  const game = await getSingleGame(gameId);
  const parsedGame = fullGameParser(game);
  const prompt = createPrompt(parsedGame);
  const embedding = await embeddingGenerator(prompt);

 

  const {
    id,
    name,
    description,
    image,
    maxplayers,
    minplayers,
    minplaytime,
    maxplaytime,
    minage,
    yearpublished,
    boardgamedesigner,
  } = parsedGame;

  return (
    <Container size={{ lg: "3", md: "3", sm: "1", xs: "1" }} pt={"2"}>
      <Flex direction={"column"} justify={"center"} gap={"3"}>
        <Heading>
          {name} - {yearpublished}
        </Heading>
        <Flex direction={"row"}>
          <Avatar src={image} fallback={name[0]} size={"9"} />
          <Flex
            direction={"column"}
            align={"start"}
            justify={"center"}
            gap={"4"}
            p={"4"}
          >
            <Flex gap={"2"} align={"center"}>
              <Pencil1Icon />
              <Text weight={"bold"}>{boardgamedesigner.join(", ")}</Text>
            </Flex>
            <Flex gap={"2"} align={"center"}>
              <StopwatchIcon />
              <Text weight={"bold"}>
                {maxplaytime === minplaytime
                  ? maxplaytime
                  : `${minplaytime} - ${maxplaytime}`}
              </Text>
            </Flex>
            <Flex gap={"2"} align={"center"}>
              <PersonIcon />
              <Text weight={"bold"}>
                {minplayers ?? ""}-{maxplayers ?? ""}
              </Text>
            </Flex>
            <Flex gap={"2"} align={"center"}>
              <CalendarIcon />
              <Text weight={"bold"}>{`+${minage}` ?? ""}</Text>
            </Flex>
          </Flex>
        </Flex>
        <Text as={"p"}>
          {trimAndClean(description, 400)}{" "}
          <Link href={`${config.BGG_GAME_URL}${gameId}`} target="_blank">
            <ExternalLinkIcon />
          </Link>
        </Text>
      </Flex>
        <RecommendationList embedding={embedding} gameId={id}/>
    </Container>
  );
}
