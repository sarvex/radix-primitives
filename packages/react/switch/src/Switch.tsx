import * as React from 'react';
import {
  cssReset,
  interopDataAttrObj,
  isFunction,
  warningOnce,
  interopSelector,
} from '@interop-ui/utils';
import { useSize } from '@interop-ui/react-use-size';
import {
  createContext,
  forwardRef,
  useCallbackRef,
  useComposedRefs,
  PrimitiveStyles,
} from '@interop-ui/react-utils';

// These props will be passed to the top-level root rather than the input when using the
// composed API so that we can share data via context.
const inputPropsForRoot = [
  'autoComplete',
  'autoFocus',
  'checked',
  'defaultChecked',
  'disabled',
  'form',
  'name',
  'onChange',
  'readOnly',
  'required',
  'value',
] as const;

type SwitchInputAttributes = typeof inputPropsForRoot[number];

/* -------------------------------------------------------------------------------------------------
 * Root level context
 * -----------------------------------------------------------------------------------------------*/

type SwitchContextValue = {
  checked: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  autoComplete: React.ComponentProps<'input'>['autoComplete'];
  disabled: React.ComponentProps<'input'>['disabled'];
  form: React.ComponentProps<'input'>['form'];
  name: React.ComponentProps<'input'>['name'];
  readOnly: React.ComponentProps<'input'>['readOnly'];
  required: React.ComponentProps<'input'>['required'];
  value: React.ComponentProps<'input'>['value'];
  boxPartRef: React.RefObject<HTMLElement | null>;
  switchWidth: number;
  thumbPartRef: React.RefObject<HTMLElement | null>;
  thumbWidth: number;
};

const [SwitchContext, useSwitchContext] = createContext<SwitchContextValue>(
  'SwitchContext',
  'Switch.Root'
);

/* -------------------------------------------------------------------------------------------------
 * SwitchRoot
 * -----------------------------------------------------------------------------------------------*/

const ROOT_NAME = 'Switch.Root';
const ROOT_DEFAULT_TAG = 'span';

type SwitchRootDOMProps = Omit<
  React.ComponentPropsWithoutRef<typeof ROOT_DEFAULT_TAG>,
  SwitchInputAttributes
>;
type SwitchRootOwnProps = Pick<React.ComponentPropsWithoutRef<'input'>, SwitchInputAttributes> & {
  children?: React.ReactElement | ((props: { checked: boolean }) => React.ReactElement);
};
type SwitchRootProps = SwitchRootDOMProps & SwitchRootOwnProps;

const SwitchRoot = forwardRef<typeof ROOT_DEFAULT_TAG, SwitchRootProps>(function SwitchRoot(
  props,
  forwardedRef
) {
  let {
    as: Comp = ROOT_DEFAULT_TAG,
    children,

    // input props
    defaultChecked,
    checked: checkedProp,
    onChange: onChangeProp,
    autoComplete,
    autoFocus,
    disabled,
    form,
    name,
    readOnly,
    required,
    style,
    value,
    ...switchProps
  } = props;

  let isControlled = React.useRef(checkedProp != null);

  let inputRef = React.useRef<HTMLInputElement>(null);

  let [_checked, setChecked] = React.useState(defaultChecked ?? false);
  let checked = isControlled.current ? checkedProp! : _checked;

  let onChange = useCallbackRef((event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeProp && onChangeProp(event);
    if (!isControlled.current) {
      setChecked(event.target.checked);
    }
  });

  let boxPartRef = React.useRef<HTMLElement>(null);
  let thumbPartRef = React.useRef<HTMLElement>(null);
  let boxPartSize = useSize({
    refToObserve: boxPartRef,
    isObserving: true,
  });
  let thumbPartSize = useSize({
    refToObserve: thumbPartRef,
    isObserving: true,
  });

  let biggestHeight = Math.max(boxPartSize?.height ?? 0, thumbPartSize?.height ?? 0);

  let switchWidth = boxPartSize?.width ?? 0;
  let thumbWidth = thumbPartSize?.width ?? 0;
  let height = biggestHeight === 0 ? undefined : biggestHeight;

  let ctx: SwitchContextValue = React.useMemo(
    () => ({
      onChange,
      checked,
      inputRef,
      autoComplete,
      disabled,
      form,
      name,
      readOnly,
      required,
      switchWidth,
      thumbWidth,
      value,
      boxPartRef,
      thumbPartRef,
    }),
    [
      onChange,
      checked,
      autoComplete,
      disabled,
      form,
      name,
      readOnly,
      required,
      switchWidth,
      thumbWidth,
      value,
    ]
  );

  return (
    <SwitchContext.Provider value={ctx}>
      <Comp
        {...interopDataAttrObj(ROOT_NAME)}
        style={{
          ...style,
          height,
        }}
        ref={forwardedRef}
        {...switchProps}
      >
        {isFunction(children) ? children({ checked }) : children}
      </Comp>
    </SwitchContext.Provider>
  );
});

/* -------------------------------------------------------------------------------------------------
 * SwitchInput
 * -----------------------------------------------------------------------------------------------*/

const INPUT_NAME = 'Switch.Input';
const INPUT_DEFAULT_TAG = 'input';

type SwitchInputDOMProps = Omit<
  React.ComponentPropsWithoutRef<typeof INPUT_DEFAULT_TAG>,
  SwitchInputAttributes
>;
type SwitchInputOwnProps = {};
type SwitchInputProps = SwitchInputDOMProps & SwitchInputOwnProps;

const SwitchInput = forwardRef<typeof INPUT_DEFAULT_TAG, SwitchInputProps>(function SwitchInput(
  props,
  forwardedRef
) {
  const { as: Comp = INPUT_DEFAULT_TAG, children, ...checkboxInputProps } = props;

  let {
    inputRef,
    checked,
    onChange,
    autoComplete,
    disabled,
    form,
    name,
    readOnly,
    required,
    value,
  } = useSwitchContext(INPUT_NAME);

  const ref = useComposedRefs(forwardedRef, inputRef);

  React.useEffect(() => {
    for (let prop of inputPropsForRoot) {
      warningOnce(
        prop,
        !Object.hasOwnProperty.call(checkboxInputProps, prop),
        `The ${prop} prop was passed to the Switch.Input component. This was likely a mistake. Instead, pass ${prop} to Switch.Root instead so that its data is available to the entire Switch component.`
      );
    }
  });

  return (
    <Comp
      {...interopDataAttrObj(INPUT_NAME)}
      ref={ref}
      {...checkboxInputProps}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      autoComplete={autoComplete}
      disabled={disabled}
      form={form}
      name={name}
      readOnly={readOnly}
      required={required}
      value={value}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * SwitchBox
 * -----------------------------------------------------------------------------------------------*/

const BOX_NAME = 'Switch.Box';
const BOX_DEFAULT_TAG = 'span';

type SwitchBoxDOMProps = React.ComponentPropsWithoutRef<typeof BOX_DEFAULT_TAG>;
type SwitchBoxOwnProps = {};
type SwitchBoxProps = SwitchBoxDOMProps & SwitchBoxOwnProps;

const SwitchBox = forwardRef<typeof BOX_DEFAULT_TAG, SwitchBoxProps>(function SwitchBox(
  props,
  forwardedRef
) {
  let { as: Comp = BOX_DEFAULT_TAG, ...checkboxBoxProps } = props;
  let { boxPartRef } = useSwitchContext(BOX_NAME);
  let ref = useComposedRefs(boxPartRef, forwardedRef);

  return <Comp {...interopDataAttrObj(BOX_NAME)} ref={ref} {...checkboxBoxProps} />;
});

/* -------------------------------------------------------------------------------------------------
 * SwitchThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = 'Switch.Thumb';
const THUMB_DEFAULT_TAG = 'span';

type SwitchThumbDOMProps = React.ComponentPropsWithoutRef<typeof THUMB_DEFAULT_TAG>;
type SwitchThumbOwnProps = {
  children?: React.ReactElement | ((props: { checked: boolean }) => React.ReactElement);
};
type SwitchThumbProps = SwitchThumbDOMProps & SwitchThumbOwnProps;

const SwitchThumb = forwardRef<typeof THUMB_DEFAULT_TAG, SwitchThumbProps>(function SwitchThumb(
  props,
  forwardedRef
) {
  let { as: Comp = THUMB_DEFAULT_TAG, children, ...checkboxBoxProps } = props;
  let { checked, switchWidth, thumbPartRef, thumbWidth } = useSwitchContext(THUMB_NAME);
  let checkedOffset = switchWidth - thumbWidth;
  let ref = useComposedRefs(thumbPartRef, forwardedRef);
  return (
    <Comp
      {...interopDataAttrObj(THUMB_NAME)}
      style={{
        transform: `translate3d(${checked ? checkedOffset + 'px' : 0}, 0, 0)`,
      }}
      ref={ref}
      {...checkboxBoxProps}
    >
      {isFunction(children) ? children({ checked }) : children}
    </Comp>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Switch
 * -----------------------------------------------------------------------------------------------*/

const SWITCH_NAME = 'Switch';
const SWITCH_DEFAULT_TAG = 'input';

type SwitchDOMProps = SwitchRootDOMProps;
type SwitchOwnProps = SwitchRootOwnProps;
type SwitchProps = SwitchDOMProps & SwitchOwnProps;

const Switch = forwardRef<typeof SWITCH_DEFAULT_TAG, SwitchInputProps, SwitchStaticProps>(
  function Switch(props, forwardedRef) {
    let { as, children, ...cotainerProps } = props;

    return (
      <SwitchRoot {...cotainerProps}>
        {({ checked }) => (
          <SwitchBox>
            <SwitchInput as={as} ref={forwardedRef} />
            <SwitchThumb>{isFunction(children) ? children({ checked }) : children}</SwitchThumb>
          </SwitchBox>
        )}
      </SwitchRoot>
    );
  }
);

/* ---------------------------------------------------------------------------------------------- */

Switch.Root = SwitchRoot;
Switch.Input = SwitchInput;
Switch.Box = SwitchBox;
Switch.Thumb = SwitchThumb;

Switch.displayName = SWITCH_NAME;
Switch.Root.displayName = ROOT_NAME;
Switch.Input.displayName = INPUT_NAME;
Switch.Box.displayName = BOX_NAME;
Switch.Thumb.displayName = THUMB_NAME;

interface SwitchStaticProps {
  Root: typeof SwitchRoot;
  Input: typeof SwitchInput;
  Box: typeof SwitchBox;
  Thumb: typeof SwitchThumb;
}

const styles: PrimitiveStyles = {
  [interopSelector(ROOT_NAME)]: {
    ...cssReset(ROOT_DEFAULT_TAG),
    display: 'inline-flex',
    position: 'relative',
    verticalAlign: 'middle',
    alignItems: 'center',
  },
  [interopSelector(INPUT_NAME)]: {
    ...cssReset(INPUT_DEFAULT_TAG),
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    opacity: 0,
  },
  [interopSelector(BOX_NAME)]: {
    ...cssReset(BOX_DEFAULT_TAG),
    position: 'relative',
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
  },
  [interopSelector(THUMB_NAME)]: {
    ...cssReset(THUMB_DEFAULT_TAG),
  },
};

export { Switch, styles };
export type { SwitchRootProps, SwitchInputProps, SwitchBoxProps, SwitchThumbProps, SwitchProps };
