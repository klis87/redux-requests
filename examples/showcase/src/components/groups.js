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

const Posts = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar style={{ minHeigh: 'auto' }} variant="dense">
          <Typography color="inherit" variant="h6" style={{ marginRight: 32 }}>
            Groups
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
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
