import React from 'react';
import { Query } from '@redux-requests/react';
import { useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
  Avatar,
  ListItemSecondaryAction,
} from '@material-ui/core';

import { FETCH_GROUPS } from '../store/constants';
import { followUser, unfollowUser } from '../store/actions';
import Spinner from './spinner';
import CodeTooltip from './code-tooltip';

const code = `const fetchGroups = () => ({
  type: FETCH_GROUPS,
  request: {
    url: '/groups',
  },
  meta: {
    normalize: true,
  },
});

const followUser = id => ({
  type: FOLLOW_USER,
  request: {
    url: \`/groups/\${id}/follow\`,
    method: 'post',
  },
  meta: {
    normalize: true,
  },
});

const unfollowUser = id => ({
  type: UNFOLLOW_USER,
  request: {
    url: \`/groups/\${id}/unfollow\`,
    method: 'post',
  },
  meta: {
    normalize: true,
  },
});`;

const Posts = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar style={{ minHeigh: 'auto' }} variant="dense">
          <Typography color="inherit" variant="h6" style={{ marginRight: 32 }}>
            Groups and automatic normalisation
          </Typography>
          <div style={{ marginLeft: 'auto' }}>
            <CodeTooltip code={code} />
          </div>
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
        <Typography paragraph>
          Notice that many people are in several groups. Try to follow/unfollow
          them and see them synchronized across multiple groups.
        </Typography>
        <Typography paragraph>
          This is handled without any manual updates instructions by automatic
          normalisation. Forget about updating data which is stored in multiple
          places, just make sure your server responds with updated nodes and the
          job will be done, all nodes will be synchronized no matter in how many
          places and how deeply stored.
        </Typography>
        <Query type={FETCH_GROUPS} loadingComponent={Spinner}>
          {({ data }) => (
            <Grid container spacing={4}>
              {data.map(group => (
                <Grid item key={group.name} xs={12} md={4}>
                  <Paper>
                    <List
                      subheader={
                        <ListSubheader>{`Group ${group.name}`}</ListSubheader>
                      }
                    >
                      {group.people.map(person => (
                        <ListItem key={person.id}>
                          <ListItemAvatar>
                            <Avatar>{person.id}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={person.name} />
                          <ListItemSecondaryAction>
                            <Button
                              variant="contained"
                              color={person.followed ? 'secondary' : 'primary'}
                              onClick={() => {
                                dispatch(
                                  person.followed
                                    ? unfollowUser(person.id)
                                    : followUser(person.id),
                                );
                              }}
                            >
                              {person.followed ? 'Unfollow' : 'Follow'}
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Query>
      </Paper>
    </div>
  );
};

export default Posts;
