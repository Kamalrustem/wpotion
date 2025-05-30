import { MyTask01Icon } from '@/components/Icons/Icons'
import getTrans from '@/utils/getTrans'
import { ContentBlock } from '@faustwp/blocks/dist/mjs/components/WordPressBlocksViewer'
import { flatListToHierarchical } from '@faustwp/core'
import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
} from '@headlessui/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'

const T = getTrans()

type HeadingNode = {
	tag: string
	id: string
	text: string
	level: number
	parentIndex: number
	parentId: string
	children?: HeadingNode[]
}

interface TableContentProps {
	content: string
	className?: string
	btnClassName?: string
	editorBlocks?: (ContentBlock | null)[]
}

const TableContent: React.FC<TableContentProps> = ({
	editorBlocks,
	content: oldContent,
	className = '',
	btnClassName = 'relative rounded-full flex items-center justify-center h-9 w-9 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
}) => {
	// function xử lý content, trả về mảng các heading theo thứ tự xuất hiện trong content (đã sắp xếp) và có thêm thuộc tính id (tạo id nếu chưa có)
	const content =
		editorBlocks
			?.map((block) => {
				if (block?.__typename === 'CoreHeading') {
					return block.renderedHtml || ''
				}
				return ''
			})
			.join('') || oldContent

	function extractHeadings(content: string) {
		const parser = new DOMParser()
		const doc = parser.parseFromString(content, 'text/html')
		const headingElements = Array.from(
			doc.querySelectorAll('h1, h2, h3, h4, h5, h6'),
		)

		let headingsWithId: HeadingNode[] = headingElements.map(
			(element, index) => {
				let id = element.getAttribute('id') || ''
				// if (!id) {
				//   id = `heading-${index + 1}`;
				//   element.setAttribute("id", id);
				// }
				return {
					tag: element.tagName.toLowerCase(),
					id,
					level: parseInt(element.tagName.charAt(1)),
					parentIndex: -1,
					parentId: '',
					text: element.textContent || '',
				}
			},
		)
		headingsWithId = headingsWithId.filter((item) => !!item.id)

		// map lại mảng headingsWithId, duyệt qua các item nếu item có level lớn hơn item trước đó thì item đó là con của item trước đó, nếu không thì item đó là con của item có level lớn hơn nó gần nhất
		headingsWithId = headingsWithId.map((item, index) => {
			let parentIndex = index - 1
			while (parentIndex >= 0) {
				if (item.level > headingsWithId[parentIndex].level) {
					item.parentIndex = parentIndex
					item.parentId = headingsWithId[parentIndex].id
					break
				}
				parentIndex--
			}
			return item
		})

		return flatListToHierarchical(headingsWithId, {
			idKey: 'id',
			parentKey: 'parentId',
		}) as HeadingNode[] | []
	}

	const headingsWrapList = extractHeadings(content)

	const renderHeadings = (headings: HeadingNode[]) => {
		return (
			<>
				{headings.map((heading) => {
					return (
						<li key={heading.id}>
							<a
								className="inline-flex gap-2 hover:text-neutral-800 dark:hover:text-neutral-200"
								href={`#${heading.id}`}
							>
								<ArrowRightIcon className="h-3 w-3 flex-shrink-0 self-center rtl:rotate-180" />
								{heading.text}
							</a>
							{heading?.children?.length ? (
								<ol className="mt-2 space-y-3 ps-4 text-neutral-500 dark:text-neutral-300">
									{renderHeadings(heading.children)}
								</ol>
							) : null}
						</li>
					)
				})}
			</>
		)
	}

	const renderContent = () => {
		return (
			<nav>
				<h2
					id="on-this-page-title"
					className="font-display text-sm font-medium text-slate-900 dark:text-white"
				>
					{T['On this page']}
				</h2>
				<div>
					<ol className="mt-4 space-y-3 text-sm">
						{renderHeadings(headingsWrapList)}
					</ol>
				</div>
			</nav>
		)
	}

	if (!headingsWrapList?.length) {
		return null
	}

	return (
		<div className={className}>
			<Popover className="relative z-40">
				{({ open }) => (
					<>
						<PopoverButton
							className={`${
								open ? '' : 'text-opacity-90'
							} group ${btnClassName} focus:outline-none focus-visible:ring-0`}
							title="Table of contents"
						>
							<MyTask01Icon className="h-[18px] w-[18px]" />
						</PopoverButton>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1"
						>
							<PopoverPanel className="lg:s-0 hiddenScrollbar absolute -end-2.5 bottom-full z-40 mb-5 max-h-[min(70vh,600px)] w-screen max-w-[min(90vw,20rem)] overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5 lg:end-auto lg:max-w-md lg:-translate-x-1/2 rtl:lg:translate-x-1/2 dark:bg-neutral-800 dark:ring-neutral-600">
								<div className="relative p-4 sm:p-7">{renderContent()}</div>
							</PopoverPanel>
						</Transition>
					</>
				)}
			</Popover>
		</div>
	)
}

export default TableContent
