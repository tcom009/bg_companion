import { Flex, Grid, Text, Badge, Box } from '@radix-ui/themes';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/logo.svg';

export default function Navbar() {
  return (
    <Grid
      position={'fixed'}
      top={'0'}
      left={'0'}
      className="black-background z-index-1"
      width={'100%'}
      columns={'5'}
      height={'9'}
    >
      <Link href={'/'} as={'/'} className="no-underline">
        <Flex
          width={'100%'}
          height={'100%'}
          align={'center'}
          ml={{ xl: '9', lg: '7', md: '5', sm: '5', xs: '5', initial: '3' }}
          gap={'2'}
        >
          <Image src={logo} width={30} height={30} alt="WiseMeeple" />
          <Text
            align={'center'}
            weight={'bold'}
            size={{ lg: '5', md: '5', sm: '5', xs: '3' }}
          >
            WiseMeeple
          </Text>
        </Flex>
      </Link>
      <Flex align={'center'} >
      <Box>
        <Badge color={'yellow'}>Last Update: September 10th</Badge>
      </Box>

      </Flex>
    </Grid>
  );
}
