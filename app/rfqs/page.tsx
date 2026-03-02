import { Suspense } from "react";
import RFQsPage from "@/templates/RFQsPage";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RFQsPage />
        </Suspense>
    );
}
