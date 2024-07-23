type Settings = {
	apiKey: string | null
	orgId: string | null
}

type Fetcher = {
	query: string
	variables: Record<string, string>
	settings: Settings
}

type Library = {
	id: string | null
	name: string | null
	photosCount: number
}

type Image = {
	id: string
	parentId?: string
	width: string
	height: string
	name: string
	libraryId: string
	blurhash: string
	url: string
	thumbUrl: string
	thumbUrlBlurred: string
	views?: [Image]
	type: string
	description: string
}
