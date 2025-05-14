import React from 'react'
import Link from 'next/link'
import MyImage from '../MyImage'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'

export interface LogoProps {
	className?: string
	imageClassName?: string
}

const Logo: React.FC<LogoProps> = ({ className = '', imageClassName }) => {
	let logoSrc = NC_SITE_SETTINGS.site_info?.site_logo || ''
	let logoLightSrc =
		NC_SITE_SETTINGS.site_info?.site_logo_light || logoSrc || ''

	if (!logoLightSrc && !logoSrc) {
		return null
	}

	return (
		<Link
			href="/"
			className={`ttnc-logo inline-block flex-shrink-0 text-primary-600 ${className}`}
		>
			<MyImage
				className={'block w-[184px] h-[42px] sm:w-[184px] sm:h-[42px] dark:hidden ' + imageClassName}
				src={logoSrc || ''}
				alt={'Logo'}
				width={184}
				height={42}
			/>
			<MyImage
				className={'hidden w-[184px] h-[42px] sm:w-[184px] sm:h-[42px] dark:block ' + imageClassName}
				src={logoLightSrc || ''}
				alt={'Logo'}
				width={184}
				height={42}
			/>
		</Link>
	)
}

export default Logo
