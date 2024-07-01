import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { createContext, useContext, useEffect, useState } from 'react'
import React from 'react'
import {
  Adapt,
  Button,
  ButtonProps,
  Checkbox,
  CheckboxProps,
  Form,
  FormProps,
  Input,
  InputProps,
  Label,
  RadioGroup,
  RadioGroupProps,
  Select,
  SelectProps,
  Sheet,
  Slider,
  SliderProps,
  Switch,
  SwitchProps,
  Text,
  TextArea,
  TextAreaProps,
  ToggleGroup,
  ToggleGroupMultipleProps,
  ToggleGroupSingleProps,
  XStack,
  YStack,
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

type FormContext = {
  values: Record<string, any>
  isSubmitting: boolean
  setValue: (key: string, value: any) => void
}

export const FormContext = createContext<FormContext>({
  get values(): never {
    throw new Error('Wrap your form with a <RiseForm /> component')
  },
  isSubmitting: false,
  setValue: () => {
    throw new Error('Wrap your form with a <RiseForm /> component')
  },
})

type RiseFormProps = Omit<FormProps, 'onSubmit'> & {
  onSubmit: (values: Record<string, any>) => void
}
export function RiseForm({ children, onSubmit, ...props }: RiseFormProps) {
  const [values, setValues] = useState({})
  const [isSubmitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    await onSubmit(values)
    setSubmitting(false)
  }

  return (
    <FormContext.Provider
      value={{
        values,
        isSubmitting,
        setValue: (key, value) => setValues((state) => ({ ...state, [key]: value })),
      }}
    >
      <Form gap="$4" {...props} onSubmit={submit}>
        {children}
      </Form>
    </FormContext.Provider>
  )
}

type InputFieldProps = Omit<InputProps, 'onChangeText' | 'value'> & {
  id: string
  label?: string | React.ReactNode
}
export function InputField({ id, defaultValue, label, ...props }: InputFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...props}
        value={formContext.values[id]}
        onChangeText={(text) => formContext.setValue(id, text)}
        id={id}
      />
    </YStack>
  )
}

type TextFieldProps = Omit<TextAreaProps, 'onChangeText' | 'value'> & {
  id: string
  label?: string | React.ReactNode
}
export function TextField({ id, defaultValue, label, ...props }: TextFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <TextArea
        {...props}
        value={formContext.values[id]}
        onChangeText={(text) => formContext.setValue(id, text)}
        id={id}
      />
    </YStack>
  )
}

type SubmitButtonProps = ButtonProps & {
  pendingState?: React.ReactNode
}
export const SubmitButton = ({ pendingState, ...props }: SubmitButtonProps) => {
  const formContext = useContext(FormContext)
  if (pendingState && formContext.isSubmitting) {
    return pendingState
  }
  return (
    <Form.Trigger asChild>
      <Button disabled={formContext.isSubmitting} {...props} />
    </Form.Trigger>
  )
}

type CheckboxFieldProps = Omit<CheckboxProps, 'onCheckedChange' | 'checked'> & {
  id: string
  label?: string | React.ReactNode
}
export const CheckboxField = ({ id, label, defaultChecked, ...props }: CheckboxFieldProps) => {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultChecked)
  }, [])
  return (
    <XStack alignItems="center" gap="$2">
      <Checkbox
        id={id}
        checked={formContext.values[id]}
        onCheckedChange={(checked) => formContext.setValue(id, checked)}
        {...props}
      >
        <Checkbox.Indicator>
          <Check />
        </Checkbox.Indicator>
      </Checkbox>
      <Label htmlFor={id}>{label}</Label>
    </XStack>
  )
}

type SwitchFieldProps = Omit<SwitchProps, 'onCheckedChange' | 'checked'> & {
  id: string
  label?: string | React.ReactNode
}
export function SwitchField({ id, defaultChecked, label, ...props }: SwitchFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultChecked)
  }, [])
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Label htmlFor={id}>{label}</Label>
      <Switch
        {...props}
        id={id}
        checked={formContext.values[id]}
        onCheckedChange={(checked) => formContext.setValue(id, checked)}
      >
        <Switch.Thumb animation="quick" />
      </Switch>
    </XStack>
  )
}

type SliderFieldProps = Omit<SliderProps, 'onValueChange' | 'value'> & {
  id: string
  label?: string | React.ReactNode
}
export function SliderField({ id, label, defaultValue, ...props }: SliderFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <Slider
        {...props}
        id={id}
        marginVertical="$4"
        defaultValue={defaultValue}
        onValueChange={(value) => formContext.setValue(id, value)}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        {defaultValue?.map((_, index) => <Slider.Thumb key={index} index={index} circular />)}
      </Slider>
    </YStack>
  )
}

type SelectFieldProps = Omit<SelectProps, 'onValueChange' | 'value'> & {
  id: string
  label?: string | React.ReactNode
  placeholder?: string | React.ReactNode
  options: { key: string; label: string }[]
}
export function SelectField({ label, id, defaultValue, placeholder, ...props }: SelectFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <Select
        {...props}
        id={id}
        value={formContext.values[id]}
        onValueChange={(value) => formContext.setValue(id, value)}
        disablePreventBodyScroll
      >
        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom animation="quick">
            <Sheet.Overlay />
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </Adapt>
        <Select.Trigger>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="$3"
            height="$3"
          >
            <YStack zIndex={10}>
              <ChevronUp size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['$background', 'transparent']}
              borderRadius="$4"
            />
          </Select.ScrollUpButton>
          <Select.Viewport
            animation="quick"
            animateOnly={['transform', 'opacity']}
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: 10 }}
            minWidth={200}
          >
            {props.options.map((item, i) => {
              return (
                <Select.Item index={i} key={item.key} value={item.key}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              )
            })}
          </Select.Viewport>
          <Select.ScrollDownButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="$3"
            height="$3"
          >
            <YStack zIndex={10}>
              <ChevronDown size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['transparent', '$background']}
              borderRadius="$4"
            />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>
    </YStack>
  )
}

type RadioGroupFieldProps = Omit<RadioGroupProps, 'onValueChange' | 'value'> & {
  id: string
  label?: string | React.ReactNode
  mode?: 'horizontal' | 'vertical'
  options: { key: string; label: string }[]
}
export function RadioGroupField({
  id,
  label,
  defaultValue,
  mode = 'vertical',
  ...props
}: RadioGroupFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <RadioGroup
        gap="$2"
        {...props}
        id={id}
        value={formContext.values[id]}
        onValueChange={(value) => formContext.setValue(id, value)}
      >
        {mode === 'horizontal' ? (
          <XStack gap="$2" justifyContent="space-between">
            {props.options.map((item) => (
              <YStack key={item.key} alignItems="center">
                <RadioGroup.Item value={item.key} id={item.key}>
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor={item.key}>{item.label}</Label>
              </YStack>
            ))}
          </XStack>
        ) : (
          <YStack>
            {props.options.map((item) => (
              <XStack key={item.key} alignItems="center" gap="$4">
                <RadioGroup.Item value={item.key} id={item.key}>
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor={item.key}>{item.label}</Label>
              </XStack>
            ))}
          </YStack>
        )}
      </RadioGroup>
    </YStack>
  )
}

type ToggleGroupFieldProps = (
  | Omit<ToggleGroupSingleProps, 'onValueChange' | 'value'>
  | Omit<ToggleGroupMultipleProps, 'onValueChange' | 'value'>
) & {
  id: string
  label?: string | React.ReactNode
  options: { key: string; label: string }[]
}
export function ToggleGroupField({
  id,
  label,
  defaultValue,
  orientation,
  ...props
}: ToggleGroupFieldProps) {
  const formContext = useContext(FormContext)
  useEffect(() => {
    formContext.setValue(id, defaultValue)
  }, [])
  return (
    <YStack>
      <Label htmlFor={id}>{label}</Label>
      <XStack flexDirection={orientation === 'horizontal' ? 'row' : 'column'}>
        <ToggleGroup
          gap="$2"
          {...props}
          orientation={orientation}
          id={id}
          value={formContext.values[id]}
          onValueChange={(value: string | string[]) => formContext.setValue(id, value)}
        >
          {props.options.map((item) => (
            <ToggleGroup.Item key={item.key} value={item.key}>
              {typeof item.label === 'string' ? <Text>{item.label}</Text> : item.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </XStack>
    </YStack>
  )
}
