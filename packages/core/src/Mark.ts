import {
  DOMOutputSpec, Mark as ProseMirrorMark, MarkSpec, MarkType,
} from '@tiptap/pm/model'
import { Plugin, Transaction } from '@tiptap/pm/state'

import { MarkConfig } from '.'
import { Editor } from './Editor'
import { getExtensionField } from './helpers/getExtensionField'
import { InputRule } from './InputRule'
import { Node } from './Node'
import { PasteRule } from './PasteRule'
import {
  AnyConfig,
  Attributes,
  Extensions,
  GlobalAttributes,
  KeyboardShortcutCommand,
  ParentConfig,
  RawCommands,
} from './types'
import { callOrReturn } from './utilities/callOrReturn'
import { mergeDeep } from './utilities/mergeDeep'

declare module '@tiptap/core' {
  export interface MarkConfig<Options = any, Storage = any, AttributeTypes = any> {
    [key: string]: any

    /**
     * Name
     */
    name: string

    /**
     * Priority
     */
    priority?: number

    /**
     * Default options
     */
    defaultOptions?: Options

    /**
     * Default Options
     */
    addOptions?: (this: {
      name: string
      parent: Exclude<ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addOptions'], undefined>
    }) => Options

    /**
     * Default Storage
     */
    addStorage?: (this: {
      name: string
      options: Options
      parent: Exclude<ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addStorage'], undefined>
    }) => Storage

    /**
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addGlobalAttributes']
    }) => GlobalAttributes | {}

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: MarkType
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addCommands']
    }) => Partial<RawCommands>

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: MarkType
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addKeyboardShortcuts']
    }) => {
      [key: string]: KeyboardShortcutCommand
    }

    /**
     * Input rules
     */
    addInputRules?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: MarkType
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addInputRules']
    }) => InputRule[]

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: MarkType
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addPasteRules']
    }) => PasteRule[]

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: MarkType
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addProseMirrorPlugins']
    }) => Plugin[]

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addExtensions']
    }) => Extensions

    /**
     * Extend Node Schema
     */
    extendNodeSchema?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['extendNodeSchema']
          },
          extension: Node,
        ) => Record<string, any>)
      | null

    /**
     * Extend Mark Schema
     */
    extendMarkSchema?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['extendMarkSchema']
          },
          extension: Mark,
        ) => Record<string, any>)
      | null

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: MarkType
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onBeforeCreate']
        }) => void)
      | null

    /**
     * The editor is ready.
     */
    onCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: MarkType
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onCreate']
        }) => void)
      | null

    /**
     * The content has changed.
     */
    onUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: MarkType
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onUpdate']
        }) => void)
      | null

    /**
     * The selection has changed.
     */
    onSelectionUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: MarkType
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onSelectionUpdate']
        }) => void)
      | null

    /**
     * The editor state has changed.
     */
    onTransaction?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: MarkType
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onTransaction']
          },
          props: {
            transaction: Transaction
          },
        ) => void)
      | null

    /**
     * The editor is focused.
     */
    onFocus?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: MarkType
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onFocus']
          },
          props: {
            event: FocusEvent
          },
        ) => void)
      | null

    /**
     * The editor isn’t focused anymore.
     */
    onBlur?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: MarkType
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onBlur']
          },
          props: {
            event: FocusEvent
          },
        ) => void)
      | null

    /**
     * The editor is destroyed.
     */
    onDestroy?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: MarkType
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['onDestroy']
        }) => void)
      | null

    /**
     * Keep mark after split node
     */
    keepOnSplit?: boolean | (() => boolean)

    /**
     * Inclusive
     */
    inclusive?:
      | MarkSpec['inclusive']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['inclusive']
          editor?: Editor
        }) => MarkSpec['inclusive'])

    /**
     * Excludes
     */
    excludes?:
      | MarkSpec['excludes']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['excludes']
          editor?: Editor
        }) => MarkSpec['excludes'])

    /**
     * Marks this Mark as exitable
     */
    exitable?: boolean | (() => boolean)

    /**
     * Group
     */
    group?:
      | MarkSpec['group']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['group']
          editor?: Editor
        }) => MarkSpec['group'])

    /**
     * Spanning
     */
    spanning?:
      | MarkSpec['spanning']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['spanning']
          editor?: Editor
        }) => MarkSpec['spanning'])

    /**
     * Code
     */
    code?:
      | boolean
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['code']
          editor?: Editor
        }) => boolean)

    /**
     * Parse HTML
     */
    parseHTML?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['parseHTML']
      editor?: Editor
    }) => MarkSpec['parseDOM']

    /**
     * Render HTML
     */
    renderHTML?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['renderHTML']
            editor?: Editor
          },
          props: {
            mark: ProseMirrorMark
            HTMLAttributes: Record<string, any>
          },
        ) => DOMOutputSpec)
      | null

    /**
     * Attributes
     */
    addAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<MarkConfig<Options, Storage, AttributeTypes>>['addAttributes']
      editor?: Editor
    }) => Attributes<AttributeTypes> | {}
  }
}

export class Mark<Options = any, Storage = any, AttributeTypes = any> {
  type = 'mark'

  name = 'mark'

  parent: Mark | null = null

  child: Mark | null = null

  options: Options

  storage: Storage

  config: MarkConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<MarkConfig<Options, Storage, AttributeTypes>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name

    if (config.defaultOptions) {
      console.warn(
        `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`,
      )
    }

    // TODO: remove `addOptions` fallback
    this.options = this.config.defaultOptions

    if (this.config.addOptions) {
      this.options = callOrReturn(
        getExtensionField<AnyConfig['addOptions']>(this, 'addOptions', {
          name: this.name,
        }),
      )
    }

    this.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(this, 'addStorage', {
        name: this.name,
        options: this.options,
      }),
    ) || {}
  }

  static create<O = any, S = any, A = any>(config: Partial<MarkConfig<O, S, A>> = {}) {
    return new Mark<O, S, A>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend()

    extension.options = mergeDeep(this.options as Record<string, any>, options) as Options

    extension.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(extension, 'addStorage', {
        name: extension.name,
        options: extension.options,
      }),
    )

    return extension
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage, ExtendedAttributeTypes = AttributeTypes>(
    extendedConfig: Partial<MarkConfig<ExtendedOptions, ExtendedStorage, ExtendedAttributeTypes>> = {},
  ) {
    const extension = new Mark<ExtendedOptions, ExtendedStorage, ExtendedAttributeTypes>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name

    if (extendedConfig.defaultOptions) {
      console.warn(
        `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`,
      )
    }

    extension.options = callOrReturn(
      getExtensionField<AnyConfig['addOptions']>(extension, 'addOptions', {
        name: extension.name,
      }),
    )

    extension.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(extension, 'addStorage', {
        name: extension.name,
        options: extension.options,
      }),
    )

    return extension
  }

  static handleExit({ editor, mark }: { editor: Editor; mark: Mark }) {
    const { tr } = editor.state
    const currentPos = editor.state.selection.$from
    const isAtEnd = currentPos.pos === currentPos.end()

    if (isAtEnd) {
      const currentMarks = currentPos.marks()
      const isInMark = !!currentMarks.find(m => m?.type.name === mark.name)

      if (!isInMark) {
        return false
      }

      const removeMark = currentMarks.find(m => m?.type.name === mark.name)

      if (removeMark) {
        tr.removeStoredMark(removeMark)
      }
      tr.insertText(' ', currentPos.pos)

      editor.view.dispatch(tr)

      return true
    }

    return false
  }
}
