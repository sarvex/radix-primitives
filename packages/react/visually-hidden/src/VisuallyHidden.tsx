import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';

import type * as Radix from '@radix-ui/react-primitive';

/* -------------------------------------------------------------------------------------------------
 * VisuallyHidden
 * -----------------------------------------------------------------------------------------------*/

const ROOT_NAME = 'VisuallyHidden';

type VisuallyHiddenElement = React.ElementRef<typeof Primitive.span>;
type PrimitiveSpanProps = Radix.ComponentPropsWithoutRef<typeof Primitive.span>;
interface VisuallyHiddenProps extends PrimitiveSpanProps {}

const VisuallyHidden = React.forwardRef<VisuallyHiddenElement, VisuallyHiddenProps>(
  (props, forwardedRef) => {
    const { __scope = ROOT_NAME, __part = ROOT_NAME, ...visuallyHiddenProps } = props;
    return (
      <Primitive.span
        {...visuallyHiddenProps}
        __scope={__scope}
        __part={__part}
        ref={forwardedRef}
        style={{
          ...props.style,
          // See: https://github.com/twbs/bootstrap/blob/master/scss/mixins/_screen-reader.scss
          position: 'absolute',
          border: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          wordWrap: 'normal',
        }}
      />
    );
  }
);

VisuallyHidden.displayName = ROOT_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root = VisuallyHidden;

export {
  VisuallyHidden,
  //
  Root,
};
export type { VisuallyHiddenProps };
