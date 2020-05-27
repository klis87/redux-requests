import React, { useState } from 'react';
import { Query, Mutation } from '@redux-requests/react';
import { useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
} from '@material-ui/core';
import { ThumbUp, ThumbDown, DragIndicator } from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { FETCH_POSTS, LIKE_POST, UNLIKE_POST } from '../store/constants';
import { reorderPosts, likePost, unlikePost } from '../store/actions';
import Spinner from './spinner';

const Posts = () => {
  const dispatch = useDispatch();
  const [optimistic, setOptimistic] = useState(true);

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar style={{ minHeigh: 'auto' }} variant="dense">
          <Typography color="inherit" variant="h6" style={{ marginRight: 32 }}>
            Posts
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={optimistic}
                onChange={e => setOptimistic(e.target.checked)}
              />
            }
            label="Optimistic updates"
          />
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
        <Query type={FETCH_POSTS} loadingComponent={Spinner}>
          {({ data }) => (
            <DragDropContext
              onDragEnd={result => {
                if (!result.destination) {
                  return;
                }

                const currentIds = data.map(v => v.id);
                const newIds = [...currentIds];
                const [removed] = newIds.splice(result.source.index, 1);
                newIds.splice(result.destination.index, 0, removed);
                dispatch(reorderPosts(newIds, currentIds, optimistic));
              }}
            >
              <Droppable droppableId="droppable">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {data.map((post, i) => (
                      <Draggable key={post.id} draggableId={post.id} index={i}>
                        {provided => (
                          <div
                            style={provided.draggableProps.style}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Paper style={{ padding: 16, marginBottom: 16 }}>
                              <div>
                                <Chip
                                  style={{ marginRight: 8 }}
                                  color="secondary"
                                  label={post.likes}
                                />
                                <Mutation type={LIKE_POST} requestKey={post.id}>
                                  {({ loading }) => (
                                    <span style={{ position: 'relative ' }}>
                                      <IconButton
                                        onClick={() =>
                                          dispatch(
                                            likePost(post.id, optimistic),
                                          )
                                        }
                                      >
                                        <ThumbUp />
                                      </IconButton>
                                      {loading && !optimistic && (
                                        <CircularProgress
                                          color="secondary"
                                          style={{
                                            position: 'absolute',
                                            left: -1,
                                            top: -15,
                                            width: 50,
                                            height: 50,
                                          }}
                                        />
                                      )}
                                    </span>
                                  )}
                                </Mutation>
                                <Mutation
                                  type={UNLIKE_POST}
                                  requestKey={post.id}
                                >
                                  {({ loading }) => (
                                    <span style={{ position: 'relative ' }}>
                                      <IconButton
                                        onClick={() =>
                                          dispatch(
                                            unlikePost(post.id, optimistic),
                                          )
                                        }
                                      >
                                        <ThumbDown />
                                      </IconButton>
                                      {loading && !optimistic && (
                                        <CircularProgress
                                          color="secondary"
                                          style={{
                                            position: 'absolute',
                                            left: -1,
                                            top: -15,
                                            width: 50,
                                            height: 50,
                                          }}
                                        />
                                      )}
                                    </span>
                                  )}
                                </Mutation>
                                <span
                                  {...provided.dragHandleProps}
                                  style={{ float: 'right' }}
                                >
                                  <DragIndicator fontSize="large" />
                                </span>
                              </div>
                              <Typography variant="h6">{post.title}</Typography>
                              <Typography>{post.description}</Typography>
                            </Paper>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Query>
      </Paper>
    </div>
  );
};

export default Posts;
