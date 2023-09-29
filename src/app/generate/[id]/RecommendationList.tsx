"use client";
import { Avatar, Button, Card, Flex, Grid, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { config } from "config";
import YearSlider from "./YearSlider";
import { useState } from "react";

interface PropsI {
  embedding: any;
  gameId: string;
}

interface StateI {
  minyear: number;
  recommendations: any[];
}

export default function RecommendationList({ embedding, gameId }: PropsI) {
  const [state, setState] = useState<StateI>({
    minyear: 2015,
    recommendations: [],
  });
  const { minyear, recommendations } = state;

  const handleSliderChange = (value: number[]) => {
    setState((prevState) => ({ ...prevState, minyear: value[0] }));
  };
  const generate = async () => {
    const response = await fetch(`/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embedding, minyear: minyear }),
    });
    const data = await response.json();
    // TODO: add this in the database stored procedure 
    const removeDuplicates = data?.length ? data.filter(
      (item: { metadata: { bgg_id: string } }) => item?.metadata.bgg_id !== gameId
    ) : []
    
    setState((prevState) => ({
      ...prevState,
      recommendations: removeDuplicates,
    }));
  };
  return (
    <>
      <Flex align={"center"} gap={"3"} mt={"4"}>
        <Text weight={"bold"} align={"right"}>
          Filter by year:
        </Text>

        <YearSlider handleYearChange={handleSliderChange} />
        <Text weight={"bold"} size={"2"}>
          {minyear} - 2023
        </Text>

        <Button onClick={generate}>Get Recommendations</Button>
      </Flex>

      {recommendations.length !== 0 && (
        <Flex align={"center"} justify={"center"} my={"5"}>
          <Text
            align={"center"}
            size={{ lg: "5", initial: "5" }}
            weight={"bold"}
          >
            {" "}
            Wise Meeple Recommends:
          </Text>
        </Flex>
      )}

      <Grid gap={"4"} columns={"3"} mt={"3"}>
        {recommendations.length !== 0 &&
          recommendations.map((game: any) => (
            <Card key={game.id}>
              <Flex align={"center"} justify={"center"} mb={"3"}>
                <Text
                  size={{ initial: "1", xl: "4", lg: "4", md: "4", sm: "4" }}
                  align={"center"}
                >
                  {" "}
                  {game.metadata.name} - {game.metadata.year_published}{" "}
                  <Link
                    href={`${config.BGG_GAME_URL}${game.metadata.bgg_id}`}
                    target="_blank"
                  >
                    <ExternalLinkIcon />
                  </Link>
                </Text>
              </Flex>
              <Flex align={"center"} justify={"center"}>
                <Avatar
                  src={game.metadata.image}
                  fallback={game.metadata.name[0]}
                  size={{ lg: "9", xl: "9", md: "7", initial: "6" }}
                />
              </Flex>
            </Card>
          ))}
      </Grid>
    </>
  );
}
