import React, { useState } from 'react'
import { ApolloError } from '@apollo/client'

import { Box } from '@material-ui/core'
import { Button, Typography, Icon, Tooltip } from '@equinor/eds-core-react'
import { add, clear } from '@equinor/eds-icons'
import { IconButton, DoneIcon, TextArea } from '@equinor/fusion-components'

import { Action, Participant, Question } from '../../api/models'
import PriorityIndicator from './PriorityIndicator'
import ActionEditSidebarWithApi from './EditForm/ActionEditSidebarWithApi'
import ActionCreateSidebarWithApi from './CreateForm/ActionCreateSidebarWithApi'
import ConfirmationDialog from './../ConfirmationDialog'
import { useParticipant } from '../../globals/contexts'
import { participantCanCreateAction, participantCanCancelAction } from '../../utils/RoleBasedAccess'

interface Props {
    question: Question
    participants: Participant[]
    cancelAction: (actionId: string) => void
    errorDeletingAction: ApolloError | undefined
}

const QuestionActionsList = ({ question, participants, cancelAction, errorDeletingAction }: Props) => {
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState<boolean>(false)
    const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState<boolean>(false)
    const [actionIdToEdit, setActionIdToEdit] = useState<string | undefined>()
    const [actionToCancel, setActionToCancel] = useState<string | undefined>()
    const actions = [...question.actions]
    const participant = useParticipant()

    const openActionEditSidebar = (action: Action) => {
        setIsEditSidebarOpen(true)
        setActionIdToEdit(action.id)
    }

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setIsCreateSidebarOpen(false)
        setActionIdToEdit(undefined)
    }

    return (
        <>
            <Box paddingLeft="9rem">
                <Box display="flex" alignItems="center">
                    <Box flexGrow={1}>
                        <Typography variant="body_short" bold>
                            Actions
                        </Typography>
                    </Box>
                    {participantCanCreateAction(participant) && (
                        <Box>
                            <Button variant="ghost" onClick={() => setIsCreateSidebarOpen(true)}>
                                <Icon data={add}></Icon>
                                Add action
                            </Button>
                        </Box>
                    )}
                </Box>
                {actions
                    .sort((a1, a2) => {
                        if (a1.createDate < a2.createDate) {
                            return -1
                        }
                        if (a1.createDate > a2.createDate) {
                            return 1
                        }
                        return 0
                    })
                    .map(action => {
                        if (errorDeletingAction !== undefined && actionToCancel === action.id) {
                            return (
                                <div>
                                    <TextArea value={`Error deleting action: ${JSON.stringify(errorDeletingAction)}`} onChange={() => {}} />
                                </div>
                            )
                        }
                        return (
                            <div key={action.id}>
                                <Box display="flex" alignItems="center">
                                    <Box p="0.3rem">
                                        <PriorityIndicator priority={action.priority} />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <Typography
                                            link
                                            onClick={() => openActionEditSidebar(action)}
                                            style={{
                                                color: action.isVoided ? 'lightgrey' : '',
                                                textDecorationLine: action.isVoided ? 'line-through' : '',
                                            }}
                                        >
                                            {action.title}
                                        </Typography>
                                        {action.completed && (
                                            <Box p="0.1rem">
                                                <Tooltip placement="bottom" title="Completed">
                                                    <Typography>
                                                        <DoneIcon data-testid={`action_complete_${action.id}`} />
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box>
                                    {participantCanCancelAction(participant) && !action.isVoided && (
                                        <Tooltip placement="bottom" title={'Cancel action'}>
                                            <IconButton
                                                data-testid={`void_action_button_${action.id}`}
                                                onClick={() => {
                                                    setIsConfirmDeleteDialogOpen(true)
                                                    setActionToCancel(action.id)
                                                }}
                                            >
                                                <Icon data={clear} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </div>
                        )
                    })}
                {actions.length === 0 && <Typography italic>No actions added</Typography>}
            </Box>
            {actionIdToEdit !== undefined && (
                <ActionEditSidebarWithApi
                    action={actions.find(a => a.id === actionIdToEdit)!}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={question}
                    possibleAssignees={participants}
                />
            )}
            <ActionCreateSidebarWithApi
                isOpen={isCreateSidebarOpen}
                onClose={onClose}
                connectedQuestion={question}
                possibleAssignees={participants}
            />
            <ConfirmationDialog
                isOpen={isConfirmDeleteDialogOpen}
                title="Cancel action"
                description="Are you sure you want to cancel the action?"
                onConfirmClick={() => {
                    cancelAction(actionToCancel!)
                    setIsConfirmDeleteDialogOpen(false)
                }}
                onCancelClick={() => {
                    setIsConfirmDeleteDialogOpen(false)
                    setActionToCancel(undefined)
                }}
            />
        </>
    )
}

export default QuestionActionsList
