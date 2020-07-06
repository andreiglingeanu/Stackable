/**
 * Internal dependencies
 */
import createStyles from './style'
import { showOptions } from './util'

/**
 * External dependencies
 */
import {
	BlockContainer,
	ContentAlignControl,
	AdvancedRangeControl,
	SvgIconPlaceholder,
	DivBackground,
	IconControlsHelper,
	PanelAdvancedSettings,
	TypographyControlHelper,
	HeadingButtonsControl,
	ColorPaletteControl,
	ResponsiveControl,
	AlignButtonsControl,
	ControlSeparator,
	PanelSpacingBody,
} from '~stackable/components'
import {
	withUniqueClass,
	withSetAttributeHook,
	withGoogleFont,
	withTabbedInspector,
	withContentAlignReseter,
	withBlockStyles,
	withClickOpenInspector,
} from '~stackable/higher-order'
import {
	createTypographyAttributeNames,
	createResponsiveAttributeNames,
	numShapesInSvg,
} from '~stackable/util'
import classnames from 'classnames'
import { i18n } from 'stackable'
import { pick, range } from 'lodash'

/**
 * WordPress dependencies
 */
import {
	PanelBody, ToggleControl,
} from '@wordpress/components'
import { __ } from '@wordpress/i18n'
import { addFilter, applyFilters } from '@wordpress/hooks'
import { Fragment } from '@wordpress/element'
import { compose } from '@wordpress/compose'
import { RichText } from '@wordpress/block-editor'

addFilter( 'stackable.icon.edit.inspector.style.before', 'stackable/icon', ( output, props ) => {
	const { setAttributes } = props
	const {
		columns,
		showTitle = false,
		titleTop = false,
		titleTag = '',
		titleColor = '',
	} = props.attributes

	const show = showOptions( props )

	return (
		<Fragment>
			{ output }
			<PanelBody title={ __( 'General', i18n ) }>
				<AdvancedRangeControl
					label={ __( 'Number of Icons / Columns', i18n ) }
					value={ columns }
					onChange={ columns => setAttributes( { columns } ) }
					min={ 1 }
					max={ 8 }
					placeholder="1"
					className="ugb--help-tip-general-columns"
				/>
				<ContentAlignControl
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				/>
			</PanelBody>

			<PanelAdvancedSettings
				title={ __( 'Icon', i18n ) }
				id="icon"
				hasToggle={ false }
			>
				<IconControlsHelper
					attrNameTemplate="icon%s"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
					onChangeIcon={ false }
					numPaths={
						// Get the most number of shapes in the SVG.
						Math.max(
							...Object.values(
								pick( props.attributes, [ 'icon1', 'icon2', 'icon3', 'icon4', 'icon5', 'icon6', 'icon7', 'icon8' ] )
							).map( icon => {
								return numShapesInSvg( icon ) || 1
							} )
						)
					}
				/>
				<ControlSeparator />
				<ResponsiveControl
					attrNameTemplate="Icon%sAlign"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				>
					<AlignButtonsControl
						label={ __( 'Align', i18n ) }
						className="ugb--help-tip-alignment-icon"
					/>
				</ResponsiveControl>
			</PanelAdvancedSettings>

			<PanelAdvancedSettings
				title={ __( 'Title', i18n ) }
				id="title"
				checked={ showTitle }
				onChange={ showTitle => setAttributes( { showTitle } ) }
				toggleOnSetAttributes={ [
					...createTypographyAttributeNames( 'title%s' ),
					'titleTag',
					'titleColor',
					...createResponsiveAttributeNames( 'Title%sAlign' ),
				] }
				toggleAttributeName="showTitle"
			>
				<ToggleControl
					label={ __( 'Title on Top', i18n ) }
					checked={ titleTop }
					onChange={ titleTop => setAttributes( { titleTop } ) }
				/>
				<TypographyControlHelper
					attrNameTemplate="title%s"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				/>
				<HeadingButtonsControl
					value={ titleTag || 'h5' }
					onChange={ titleTag => setAttributes( { titleTag } ) }
				/>
				<ColorPaletteControl
					value={ titleColor }
					onChange={ titleColor => setAttributes( { titleColor } ) }
					label={ __( 'Title Color', i18n ) }
				/>
				<ResponsiveControl
					attrNameTemplate="Title%sAlign"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				>
					<AlignButtonsControl
						label={ __( 'Align', i18n ) }
						className="ugb--help-tip-alignment-title"
					/>
				</ResponsiveControl>
			</PanelAdvancedSettings>

			<PanelSpacingBody initialOpen={ false } blockProps={ props }>
				<ResponsiveControl
					attrNameTemplate="icon%sBottomMargin"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				>
					<AdvancedRangeControl
						label={ __( 'Icon', i18n ) }
						min={ -50 }
						max={ 100 }
						allowReset={ true }
						className="ugb--help-tip-spacing-icon"
					/>
				</ResponsiveControl>
				{ show.titleSpacing && (
					<ResponsiveControl
						attrNameTemplate="title%sBottomMargin"
						setAttributes={ setAttributes }
						blockAttributes={ props.attributes }
					>
						<AdvancedRangeControl
							label={ __( 'Title', i18n ) }
							min={ -50 }
							max={ 100 }
							allowReset={ true }
							className="ugb--help-tip-spacing-title"
						/>
					</ResponsiveControl>
				) }
			</PanelSpacingBody>
		</Fragment>
	)
} )

const edit = props => {
	const {
		className,
		setAttributes,
		attributes,
	} = props

	const {
		design = 'basic',
		columns = 1,
		showTitle = false,
		titleTop = false,
		titleTag = '',
	} = props.attributes

	const show = showOptions( props )

	const mainClasses = classnames( [
		className,
		`ugb-icon--design-${ design }`,
	], applyFilters( 'stackable.icon.mainclasses', {
	}, props ) )

	return (
		<BlockContainer.Edit className={ mainClasses } blockProps={ props } render={ () => (
			<Fragment>
				{ range( 1, columns + 1 ).map( i => {
					const icon = attributes[ `icon${ i }` ]
					const title = attributes[ `title${ i }` ]

					const boxClasses = classnames( [
						'ugb-icon__item',
						`ugb-icon__item${ i }`,
					], applyFilters( 'stackable.icon.boxclasses', {}, design, props ) )

					const iconComp = (
						<div className="ugb-icon__icon">
							<SvgIconPlaceholder
								attrNameTemplate="icon%s"
								blockAttributes={ props.attributes }
								value={ icon }
								onChange={ value => setAttributes( { [ `icon${ i }` ]: value } ) }
							/>
						</div>
					)

					const titleComp = showTitle &&
						<RichText
							tagName={ titleTag || 'h5' }
							className="ugb-icon__title"
							value={ title }
							placeholder={ __( 'Title', i18n ) }
							onChange={ value => setAttributes( { [ `title${ i }` ]: value } ) }
							keepPlaceholderOnFocus
						/>

					let comps = [ iconComp, titleComp ]
					if ( titleTop ) {
						comps = [ titleComp, iconComp ]
					}

					return (
						<DivBackground
							className={ boxClasses }
							backgroundAttrName="column%s"
							blockProps={ props }
							showBackground={ show.columnBackground }
							key={ i }
						>
							{ comps }
						</DivBackground>
					)
				} ) }
			</Fragment>
		) } />
	)
}

export default compose(
	withUniqueClass,
	withSetAttributeHook,
	withGoogleFont,
	withTabbedInspector(),
	withContentAlignReseter( [ 'Icon%sAlign', 'Title%sAlign' ] ),
	withBlockStyles( createStyles, { editorMode: true } ),
	withClickOpenInspector( [
		[ '.ugb-icon__item', 'column-background' ],
		[ '.ugb-icon-inner-svg svg', 'icon' ],
		[ '.ugb-icon__title', 'title' ],
	] ),
)( edit )
