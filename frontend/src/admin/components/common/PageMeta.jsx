// src/admin/components/common/PageMeta.jsx
import { Helmet } from "react-helmet-async";

const PageMeta = ({ title, description }) => (
    <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
    </Helmet>
);

export default PageMeta;
