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
import CodeTooltip from './code-tooltip';

const code0 = `const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: {
    url: '/posts',
  },
});

const likePost = id => ({
  type: LIKE_POST,
  request: {
    url: \`/posts/\${id}/like\`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateDataOptimistic: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v)),
        revertData: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v)),
      },
    },
  },
});

const unlikePost = id => ({
  type: UNLIKE_POST,
  request: {
    url: \`/posts/\${id}/unlike\`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateDataOptimistic: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v)),
        revertData: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v)),
      },
    },
  },
});

const reorderPosts = (newIds, currentIds) => ({
  type: REORDER_POSTS,
  request: {
    url: '/posts/reorder',
    method: 'post',
    data: {
      ids: newIds,
    },
  },
  meta: {
    mutations: {
      [FETCH_POSTS]: {
        updateDataOptimistic: data =>
          newIds.map(id => data.find(v => v.id === id)),
        revertData: data =>
          currentIds.map(id => data.find(v => v.id === id)),
      },
    },
  },
});`;

const code1 = `const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: {
    url: '/posts',
  },
});

const likePost = id => ({
  type: LIKE_POST,
  request: {
    url: \`/posts/\${id}/like\`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateData: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v)),
      },
    },
  },
});

const unlikePost = id => ({
  type: UNLIKE_POST,
  request: {
    url: \`/posts/\${id}/unlike\`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateData: data =>
          data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v)),
      },
    },
  },
});

const reorderPosts = newIds => ({
  type: REORDER_POSTS,
  request: {
    url: '/posts/reorder',
    method: 'post',
    data: {
      ids: newIds,
    },
  },
  meta: {
    mutations: {
      [FETCH_POSTS]: {
        updateData: (data, mutationData) => mutationData,
      },
    },
  },
});`;

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
          <div style={{ marginLeft: 'auto' }}>
            <CodeTooltip code={optimistic ? code0 : code1} />
          </div>
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
        <Typography paragraph>
          Optimistic updates allow to update data before even requests are
          finished, so UI feels much faster.
        </Typography>
        <Typography paragraph>
          Try to drag icons on the right of items to change sorting, click{' '}
          <b>LIKE</b> and <b>UNLIKE</b> buttons and notice data updates while
          requests are still pending.
        </Typography>
        <Typography paragraph>
          Turn off <b>OPTIMISTIC UPDATES</b> and do the same, notice data is not
          updated immediately anymore. See also sorting animation problem, which
          in theory could be solved without optimistic updates too, but then you
          would need to keep copy of data state, which would be error-prone.
        </Typography>
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
                        {providedNested => (
                          <div
                            style={providedNested.draggableProps.style}
                            ref={providedNested.innerRef}
                            {...providedNested.draggableProps}
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
                                  {...providedNested.dragHandleProps}
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
