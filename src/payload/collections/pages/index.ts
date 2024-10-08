import {
	FixedToolbarFeature,
	HeadingFeature,
	HTMLConverterFeature,
	InlineToolbarFeature,
	lexicalEditor,
	lexicalHTML,
} from "@payloadcms/richtext-lexical";

import { isAdmin } from "@/payload-access/isAdmin";
import { isAdminOrHasSiteAccessOrPublished } from "@/payload-access/isAdminOrHasSiteAccessOrPublished";
import { isAdminOrHasSiteAccess } from "@/payload-access/isAdminOrHasSiteAccess";
import { isSignedIn } from "@/payload-access/isSignedIn";

import type { CollectionConfig } from "payload";

const Pages: CollectionConfig = {
	slug: "pages",
	labels: {
		singular: "Page",
		plural: "Pages",
	},
	admin: {
		defaultColumns: ["title", "site", "createdAt"],
		useAsTitle: "title",
	},
	access: {
		// anyone signed in can create
		create: isSignedIn,
		// only admins or editors with site access can update
		update: isAdminOrHasSiteAccess(),
		// admins or editors with site access can read,
		// otherwise users not logged in can only read published
		read: isAdminOrHasSiteAccessOrPublished,
		// only admins can delete
		delete: isAdmin,
	},
	fields: [
		{
			name: "title",
			label: "Title",
			type: "text",
			required: true,
		},
		{
			name: "content",
			label: "Content",
			type: "richText",
			required: true,
			editor: lexicalEditor({
				features: ({ rootFeatures }) => {
					return [
						...rootFeatures,
						FixedToolbarFeature(),
						HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
						/* the HTMLConverterFeature manages the HTML serializers */
						HTMLConverterFeature({}),
						InlineToolbarFeature(),
					];
				},
			}),
		},
		/* converts the referenced lexical richText field into HTML */
		lexicalHTML("content", { name: "content_html" }),
		{
			name: "site",
			label: "Site",
			type: "relationship",
			relationTo: "sites",
			required: true,
			// if user is not admin, set the site by default
			// to the first site that they have access to
			defaultValue: ({ user }: { user: { roles: string[]; sites?: string[] } }) => {
				if (!user.roles.includes("admin") && user.sites?.[0]) {
					return user.sites[0];
				}
			},
		},
	],
	versions: {
		drafts: true,
	},
};

export default Pages;
