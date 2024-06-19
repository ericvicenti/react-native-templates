import { Icon as LucideIcon } from '@rise-tools/kit/server'
import { goBack, navigate, StackScreen } from '@rise-tools/kit-expo-router/server'
import { toast } from '@rise-tools/kit-tamagui-toast/server'
import { event, response, setStateAction } from '@rise-tools/react'
import {
  Button,
  Circle,
  Form,
  FormTrigger,
  H2,
  H3,
  Input,
  Text,
  TextArea,
  Theme,
  XStack,
  YStack,
} from '@rise-tools/tamagui/server'
import { state } from '@rise-tools/server'

export const models = {
  delivery: UI,
  'delivery:feedback-form': FeedbackForm,
}

function UI() {
  return (
    <YStack gap="$4" backgroundColor="$background">
      <Survey />
      <Groceries />
      <Restaurants />
      <Taxi />
    </YStack>
  )
}

const [name, setName] = state('')
const [feedback, setFeedback] = state('')

function FeedbackForm() {
  const onFormSubmit = () => {
    console.log('Form submitted', name.get(), feedback.get())

    // reset fields
    setName('')
    setFeedback('')

    // return response
    return response(null).action(toast('Thank you for submitting your feedback')).action(goBack())
  }
  
  return (
    <>
      <StackScreen options={{ title: 'Feedback' }} />
      <YStack gap="$4" padding="$4">
        <H2>Send feedback</H2>
        <YStack gap="$8" padding="$4">
          <Form onSubmit={onFormSubmit}>
            <YStack gap="$4">
              <Text>Name</Text>
              <Input onChangeText={setName} />
              <Text>Feedback</Text>
              <TextArea onChangeText={setFeedback} />
            </YStack>
            <Button onPress={onFormSubmit}>Submit</Button>
          </Form>
        </YStack>
      </YStack>
    </>
  )
}

function Groceries() {
  return (
    <Section>
      <Title>Groceries</Title>
      <Content>
        <Icon />
        <Icon />
        <Icon />
        <Icon />
        <Icon />
        <Icon />
      </Content>
    </Section>
  )
}

function Restaurants() {
  return (
    <Section>
      <Title>Restaurants</Title>
      <Content>
        <Icon />
        <Icon />
        <Icon />
        <Icon />
        <Icon />
        <Icon />
      </Content>
    </Section>
  )
}

function Taxi() {
  return (
    <Section>
      <Title>Summon Taxi</Title>
      <Content>
        <Button flex={1} color="white" fontWeight="bold" fontSize="$5">
          Quick Ride
        </Button>
        <Button flex={1} color="white" fontWeight="bold" fontSize="$5">
          Shared Ride
        </Button>
      </Content>
    </Section>
  )
}

function Survey() {
  return (
    <Theme name="green_active">
      <XStack backgroundColor="$backgroundFocus" padding="$4" gap="$4" alignItems="center">
        <LucideIcon icon="MessageCircleHeart" size="$6" color="white" />
        <YStack justifyContent="flex-start" gap="$2">
          <H3 color="white">Do you like the App?</H3>
          <Button
            fontSize="$5"
            fontWeight="bold"
            color="white"
            onPress={navigate('delivery:feedback-form')}
          >
            Send Feedback
          </Button>
        </YStack>
      </XStack>
    </Theme>
  )
}

/* Utils */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Theme name="green_active">
      <YStack
        gap="$2"
        borderColor="$borderColor"
        borderRadius="$8"
        borderWidth="$2"
        padding="$4"
        marginHorizontal="$4"
      >
        {children}
      </YStack>
    </Theme>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return <H3 color="$backgroundFocus" lineHeight="$2">{children}</H3>
}

function Content({ children }: { children: React.ReactNode }) {
  return <XStack gap="$2">{children}</XStack>
}

function Icon() {
  return <Circle size="$5" backgroundColor="$backgroundFocus" />
}