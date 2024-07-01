import { goBack } from '@rise-tools/kit-react-navigation/server'
import {
  RadioGroupField,
  RiseForm,
  SubmitButton,
  Text,
  TextField,
  toast,
  View,
} from '@rise-tools/kitchen-sink/server'
import { response } from '@rise-tools/react'

export function FeedbackForm() {
  return (
    <View padding="$4">
      <RiseForm
        onSubmit={(values) => {
          if (!values['usefulness']) {
            return response(toast('Please tell us how useful Rise is!'))
          }
          return response([toast('Thank you for your feedback!'), goBack()])
        }}
      >
        <RadioGroupField
          id="usefulness"
          mode="horizontal"
          label="How useful is Rise?"
          options={[
            { label: '1', key: '1' },
            { label: '2', key: '2' },
            { label: '3', key: '3' },
            { label: '4', key: '4' },
            { label: '5', key: '5' },
          ]}
        />
        <TextField id="notes" label="Additional comments" />
        <SubmitButton>Submit</SubmitButton>
      </RiseForm>
    </View>
  )
}
