/**
 * External dependencies
 */
import { orderBy } from 'lodash'
import ControlSeparator from '../control-separator'
import { getAllBlocks, getDesigns } from '~stackable/design-library'
import { i18n } from 'stackable'
import classnames from 'classnames'

/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element'
import { select } from '@wordpress/data'
import { __ } from '@wordpress/i18n'

const BlockList = props => {
	const [ blockDesignList, setBlockDesignList ] = useState( [] )
	const [ blockList, setBlockList ] = useState( {} )
	const [ totalDesigns, setTotalDesigns ] = useState( 0 )
	const [ totalFree, setTotalFree ] = useState( 0 )
	const [ totalPremium, setTotalPremium ] = useState( 0 )
	const [ selected, setSelected ] = useState( '' )

	// Create our block list.
	useEffect( () => {
		getAllBlocks().then( blocks => {
			const blockList = blocks.reduce( ( blocks, name ) => {
				if ( ! blocks[ name ] ) {
					// Ignore if block is hidden from the Block Manager.
					if ( select( 'core/edit-post' ).getPreference( 'hiddenBlockTypes' ).includes( name ) ) {
						return blocks
					}

					// Ignore if block is not implemented (probably a new block).
					if ( ! select( 'core/blocks' ).getBlockType( name ) ) {
						return blocks
					}

					blocks[ name ] = {
						count: 0,
						name,
						label: name ? select( 'core/blocks' ).getBlockType( name ).title : '',
					}
				}

				return blocks
			}, {} )
			setBlockList( blockList )
		} )
	}, [] )

	useEffect( () => {
		if ( ! Object.keys( blockList ).length ) {
			return
		}

		getDesigns( {
			type: 'block',
			search: props.search,
			mood: props.mood,
			colors: props.colors,
		} ).then( designs => {
			// We need to create a blank list first.
			const initBlocks = Object.keys( blockList ).reduce( ( blocks, name ) => {
				blocks[ name ] = { ...blockList[ name ] }
				return blocks
			}, {} )

			// Count the number of designs per block.
			let freeDesigns = 0
			let allDesigns = 0
			const blocks = designs.reduce( ( blocks, design ) => {
				const {
					block, type, plan,
				} = design
				if ( type === 'block' && blocks[ block ] ) {
					blocks[ block ].count++
				}
				if ( ! props.forceBlock || props.forceBlock === design.block ) {
					allDesigns++
					if ( plan === 'free' ) {
						freeDesigns++
					}
				}
				return blocks
			}, { ...initBlocks } )

			setTotalDesigns( allDesigns )
			setTotalFree( freeDesigns )
			setTotalPremium( allDesigns - freeDesigns )
			setBlockDesignList( orderBy( blocks, [ 'title' ], [ 'asc' ] ) )
		} )
	}, [ blockList, props.search, props.mood, props.colors ] )

	return (
		<ul className="ugb-block-list">
			<li>
				<div
					className={ selected === '' ? 'is-active' : '' }
					data-count={ totalDesigns }
					onClick={ () => {
						setSelected( '' )
						props.onSelect( { block: '', plan: '' } )
					} }
					onKeyPress={ e => {
						if ( e.keyCode === 13 ) {
							this.click()
						}
					} }
					role="button"
					tabIndex={ 0 }
					aria-pressed={ selected === '' ? 'true' : 'false' }
				>
					{ __( 'All Block Designs', i18n ) }
					<span
						className="ugb-block-list__count"
						data-testid="all-count"
					>{ totalDesigns }</span>
				</div>
			</li>
			{ totalDesigns !== totalFree &&
				<li>
					<div
						className={ selected === 'free' ? 'is-active' : '' }
						data-count={ totalFree }
						onClick={ () => {
							setSelected( 'free' )
							props.onSelect( { block: '', plan: 'free' } )
						} }
						onKeyPress={ e => {
							if ( e.keyCode === 13 ) {
								this.click()
							}
						} }
						role="button"
						tabIndex={ 0 }
						aria-pressed={ selected === 'free' ? 'true' : 'false' }
					>
						{ __( 'Free Designs', i18n ) }
						<span
							className="ugb-block-list__count"
							data-testid="free-count"
						>{ totalFree }</span>
					</div>
					<div
						className={ selected === 'premium' ? 'is-active' : '' }
						data-count={ totalPremium }
						onClick={ () => {
							setSelected( 'premium' )
							props.onSelect( { block: '', plan: 'premium' } )
						} }
						onKeyPress={ e => {
							if ( e.keyCode === 13 ) {
								this.click()
							}
						} }
						role="button"
						tabIndex={ 0 }
						aria-pressed={ selected === 'premium' ? 'true' : 'false' }
					>
						{ __( 'Premium Designs', i18n ) }
						<span
							className="ugb-block-list__count"
							data-testid="premium-count"
						>{ totalPremium }</span>
					</div>
				</li>
			}
			<ControlSeparator />
			{ blockDesignList.map( ( block, i ) => {
				const isSelected = selected === block.name || block.name === props.forceBlock
				const classes = classnames( {
					'is-active': isSelected,
					'is-disabled': props.forceBlock && block.name !== props.forceBlock,
				} )

				return (
					<li key={ i }>
						<div
							className={ classes }
							data-count={ block.count }
							onClick={ () => {
								if ( ! props.forceBlock ) {
									setSelected( block.name )
									props.onSelect( { block: block.name, plan: '' } )
								}
						 } }
							onKeyPress={ e => {
							 if ( e.keyCode === 13 ) {
								 this.click()
							 }
						 } }
							role="button"
							tabIndex={ 0 }
							aria-pressed={ isSelected ? 'true' : 'false' }
						>
							{ block.label }
							<span
								className="ugb-block-list__count"
								data-testid={ `${ block.name }-count` }
							>{ block.count }</span>
						</div>
					</li>
				)
			} ) }
		</ul>
	)
}

BlockList.defaultProps = {
	search: '',
	mood: '',
	colors: [],
	onSelect: () => {},
	forceBlock: '',
}

export default BlockList
