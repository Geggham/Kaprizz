export type NavigationLinkView = {
  href: string;
  label: string;
};

export type NavigationGroupView = {
  id: string;
  title: string;
  links: NavigationLinkView[];
};

export type NavigationItemView = {
  id: string;
  href: string;
  label: string;
  image?: string;
  imageAlt?: string;
  groups?: NavigationGroupView[];
};
