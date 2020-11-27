import { Chip } from '@equinor/fusion-components'
import React, { useEffect, useState } from 'react'
import { Typography } from '@equinor/eds-core-react'

import { Answer, Question } from '../../api/models'
import { Box, Grid } from '@material-ui/core'
import AnswerSeverityForm from './AnswerSeverityForm'
import AnswerMarkdownForm from './AnswerMarkdownForm'
import { organizationToString } from '../../utils/EnumToString'

const WRITE_DELAY_MS = 1000

interface QuestionAndAnswerFormProps {
    questionNumber: number
    question: Question
    answer: Answer
    onAnswerChange: (answer: Answer) => void
}

const QuestionAndAnswerForm = ({questionNumber, question, answer, onAnswerChange}: QuestionAndAnswerFormProps) => {
    const [localAnswer, setLocalAnswer] = useState<Answer>(answer)

    useEffect(() => {
        const timeout = setTimeout(() => {
            onAnswerChange(localAnswer)
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [localAnswer])

    return <>
        <Grid container>
            <Grid item xs={12}>
                <Box display="flex" flexDirection="row-reverse">
                    <Box>
                        <Chip primary title={organizationToString(question.organization)}/>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" mb={3}>
                    <Box ml={2} mr={1}>
                        <Typography variant="h3">{questionNumber}.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h3">{question.text}</Typography>
                        <Typography>{question.supportNotes}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex">
                    <Box mr={5}>
                        <AnswerSeverityForm
                            severity={localAnswer.severity}
                            onSeveritySelected={(severity) => setLocalAnswer((oldAnswer) => ({...oldAnswer, severity: severity}))}
                        />
                    </Box>
                    <Box width="85%">
                        <AnswerMarkdownForm
                            markdown={localAnswer.text}
                            onMarkdownChange={(text) => setLocalAnswer((oldAnswer) => ({...oldAnswer, text: text}))}
                        />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    </>
}

export default QuestionAndAnswerForm
