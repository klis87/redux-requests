import React, { useEffect, useState } from 'react';
import { Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { makeStyles } from '@material-ui/core/styles';
import theme from 'prism-react-renderer/themes/nightOwl';

const useStyles = makeStyles(() => ({
  tooltip: {
    maxWidth: 'none',
    padding: 0,
  },
  arrow: {
    color: 'rgb(42, 39, 52)',
  },
  icon: {
    animation: '$shake 0.2s infinite linear',
  },
  '@keyframes shake': {
    '0%, 50%, 100%': {
      transform: 'translateX(0%)',
    },
    '25%': {
      transform: 'translateX(-20%)',
    },
    '75%': {
      transform: 'translateX(20%)',
    },
  },
}));

const CodeTooltip = ({ code }) => {
  const classes = useStyles();
  const [pristine, setPristine] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!pristine) {
      setAnimate(true);

      setTimeout(() => setAnimate(false), 600);
    }

    setPristine(false);
  }, [code, pristine]);

  return (
    <Tooltip
      title={
        <Highlight {...defaultProps} code={code} language="js" theme={theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={className}
              style={{
                ...style,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.4,
                maxHeight: '45vh',
                overflow: 'auto',
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      }
      arrow
      interactive
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
    >
      <Help
        fontSize="large"
        style={{ marginLeft: 16 }}
        className={animate ? classes.icon : undefined}
      />
    </Tooltip>
  );
};

export default CodeTooltip;
